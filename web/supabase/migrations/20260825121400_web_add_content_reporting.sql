-- Royz Houz web foundation: protected public content reports.
--
-- Ownership: web/supabase/migrations
-- Reports are private operational records. Browsers submit through the web API;
-- only the service role may execute the narrow submission RPC.

create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  submission_key uuid not null unique,
  target_type text not null check (target_type in ('talent_media', 'media_asset')),
  talent_id uuid references public.talents(id) on delete restrict,
  media_asset_id uuid references public.media_assets(id) on delete restrict,
  target_key text not null check (
    char_length(target_key) between 1 and 160
    and target_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  target_title_snapshot text not null check (char_length(trim(target_title_snapshot)) between 1 and 200),
  reason_code text not null check (
    reason_code in ('copyright', 'inappropriate', 'misinformation', 'spam', 'other')
  ),
  details text check (details is null or char_length(trim(details)) between 1 and 2000),
  reporter_email text check (
    reporter_email is null or (
      char_length(trim(reporter_email)) between 3 and 254
      and reporter_email = lower(reporter_email)
      and reporter_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    )
  ),
  workflow_status text not null default 'new' check (
    workflow_status in ('new', 'reviewing', 'actioned', 'dismissed', 'duplicate', 'archived')
  ),
  assigned_to uuid references auth.users(id) on delete set null,
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 5000),
  resolution text check (resolution is null or char_length(resolution) <= 2000),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint content_reports_exact_target check (
    (target_type = 'talent_media' and talent_id is not null and media_asset_id is null)
    or
    (target_type = 'media_asset' and media_asset_id is not null and talent_id is null)
  ),
  constraint content_reports_other_details check (
    reason_code <> 'other' or details is not null
  ),
  constraint content_reports_resolution_state check (
    (workflow_status in ('actioned', 'dismissed', 'duplicate') and resolved_at is not null and resolution is not null)
    or
    (workflow_status = 'archived' and resolved_at is not null)
    or
    (workflow_status in ('new', 'reviewing') and resolved_at is null and resolved_by is null and resolution is null)
  )
);

create index content_reports_status_created_idx
  on public.content_reports (workflow_status, created_at desc);
create index content_reports_reason_created_idx
  on public.content_reports (reason_code, created_at desc);
create index content_reports_talent_id_idx
  on public.content_reports (talent_id) where talent_id is not null;
create index content_reports_media_asset_id_idx
  on public.content_reports (media_asset_id) where media_asset_id is not null;
create index content_reports_assigned_to_idx
  on public.content_reports (assigned_to) where assigned_to is not null;

create trigger content_reports_set_updated_at before update on public.content_reports
  for each row execute function public.set_updated_at();

alter table public.content_reports enable row level security;
revoke all on table public.content_reports from public, anon, authenticated;

comment on table public.content_reports is
  'Private reports against published Talent productions and Media Library assets. Reporter PII and internal moderation fields are never public.';
comment on column public.content_reports.submission_key is
  'Client-generated idempotency key. Repeated submissions with the same key return the original report id.';
comment on column public.content_reports.target_title_snapshot is
  'Non-authoritative moderation snapshot; target foreign keys remain authoritative.';
comment on column public.content_reports.internal_notes is
  'Private administrative notes. Never include in public API responses or audit payloads.';

create or replace function public.submit_content_report(
  p_submission_key uuid,
  p_target_type text,
  p_target_id uuid,
  p_target_key text,
  p_target_title text,
  p_reason_code text,
  p_details text default null,
  p_reporter_email text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  report_id uuid;
  target_exists boolean := false;
begin
  if p_submission_key is null
    or p_target_id is null
    or p_target_type not in ('talent_media', 'media_asset')
    or p_target_key !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or char_length(p_target_key) > 160
    or char_length(trim(coalesce(p_target_title, ''))) not between 1 and 200
    or p_reason_code not in ('copyright', 'inappropriate', 'misinformation', 'spam', 'other')
    or (p_reason_code = 'other' and char_length(trim(coalesce(p_details, ''))) = 0)
    or char_length(coalesce(p_details, '')) > 2000
    or char_length(coalesce(p_reporter_email, '')) > 254 then
    raise exception 'invalid content report input';
  end if;

  if p_reporter_email is not null and lower(trim(p_reporter_email)) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'invalid reporter email';
  end if;

  if p_target_type = 'media_asset' then
    select exists (
      select 1
      from public.media_assets asset
      where asset.id = p_target_id
        and asset.slug = p_target_key
        and asset.status = 'published'
        and asset.published_at is not null
        and asset.published_at <= timezone('utc', now())
    ) into target_exists;
  else
    select exists (
      select 1
      from public.talents talent
      where talent.id = p_target_id
        and talent.status = 'published'
        and talent.published_at is not null
        and talent.published_at <= timezone('utc', now())
        and exists (
          select 1
          from jsonb_array_elements(
            coalesce(talent.body -> 'videos', '[]'::jsonb)
            || coalesce(talent.body -> 'musicTracks', '[]'::jsonb)
          ) item
          where item ->> 'slug' = p_target_key
             or item ->> 'id' = p_target_key
             or trim(both '-' from regexp_replace(lower(coalesce(item ->> 'title', '')), '[^a-z0-9]+', '-', 'g')) = p_target_key
        )
    ) into target_exists;
  end if;

  if not target_exists then
    raise exception 'report target is unavailable';
  end if;

  insert into public.content_reports (
    submission_key,
    target_type,
    talent_id,
    media_asset_id,
    target_key,
    target_title_snapshot,
    reason_code,
    details,
    reporter_email
  ) values (
    p_submission_key,
    p_target_type,
    case when p_target_type = 'talent_media' then p_target_id else null end,
    case when p_target_type = 'media_asset' then p_target_id else null end,
    p_target_key,
    trim(p_target_title),
    p_reason_code,
    nullif(trim(coalesce(p_details, '')), ''),
    nullif(lower(trim(coalesce(p_reporter_email, ''))), '')
  )
  on conflict (submission_key) do update
    set submission_key = excluded.submission_key
  returning id into report_id;

  return report_id;
end;
$$;

revoke all on function public.submit_content_report(uuid, text, uuid, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_content_report(uuid, text, uuid, text, text, text, text, text)
  to service_role;
