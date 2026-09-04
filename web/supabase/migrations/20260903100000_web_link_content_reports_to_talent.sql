-- Preserve the Talent page context when a report targets a Media Library asset.
-- This lets administrators contact the Talent associated with a production.

alter table public.content_reports
  drop constraint content_reports_exact_target;

alter table public.content_reports
  add constraint content_reports_exact_target check (
    (target_type = 'talent_media' and talent_id is not null and media_asset_id is null)
    or
    (target_type = 'media_asset' and media_asset_id is not null)
  );

-- Keep the original function signature intact for standalone reports while
-- adding an overload that records the optional Talent context for asset reports.
create or replace function public.submit_content_report(
  p_submission_key uuid,
  p_target_type text,
  p_target_id uuid,
  p_talent_id uuid,
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
begin
  if p_target_type = 'talent_media' and p_talent_id is not null and p_talent_id <> p_target_id then
    raise exception 'invalid talent context';
  end if;

  if p_target_type = 'media_asset' and p_talent_id is not null and not exists (
    select 1
    from public.talents talent
    where talent.id = p_talent_id
      and talent.status = 'published'
      and talent.published_at is not null
      and talent.published_at <= timezone('utc', now())
  ) then
    raise exception 'invalid talent context';
  end if;

  report_id := public.submit_content_report(
    p_submission_key,
    p_target_type,
    p_target_id,
    p_target_key,
    p_target_title,
    p_reason_code,
    p_details,
    p_reporter_email
  );

  if p_target_type = 'media_asset' and p_talent_id is not null then
    update public.content_reports
    set talent_id = p_talent_id
    where id = report_id;
  end if;

  return report_id;
end;
$$;

revoke all on function public.submit_content_report(uuid, text, uuid, uuid, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.submit_content_report(uuid, text, uuid, uuid, text, text, text, text, text)
  to service_role;
