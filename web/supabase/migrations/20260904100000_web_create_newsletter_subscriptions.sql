-- Newsletter subscriptions are separate from contact submissions so they can be
-- managed as an audience and safely re-subscribed without exposing email data.
create table if not exists public.newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'website',
  status text not null default 'subscribed' check (status in ('subscribed', 'unsubscribed')),
  subscribed_at timestamptz not null default timezone('utc', now()),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  updated_by uuid references auth.users(id) on delete set null,
  constraint newsletter_subscriptions_email_format check (email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$')
);

create unique index if not exists newsletter_subscriptions_email_lower_idx
  on public.newsletter_subscriptions (lower(email));
create index if not exists newsletter_subscriptions_status_created_idx
  on public.newsletter_subscriptions (status, created_at desc);

alter table public.newsletter_subscriptions enable row level security;

create or replace function public.subscribe_to_newsletter(p_email text, p_source text default 'website')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  subscription_id uuid;
  normalized_email text := lower(trim(p_email));
begin
  if normalized_email is null or normalized_email = '' then
    raise exception 'A valid email address is required';
  end if;

  insert into public.newsletter_subscriptions (email, source, status, subscribed_at, unsubscribed_at, updated_at)
  values (normalized_email, coalesce(nullif(trim(p_source), ''), 'website'), 'subscribed', timezone('utc', now()), null, timezone('utc', now()))
  on conflict (lower(email)) do update
    set status = 'subscribed', source = excluded.source,
        subscribed_at = timezone('utc', now()), unsubscribed_at = null,
        updated_at = timezone('utc', now())
  returning id into subscription_id;

  return subscription_id;
end;
$$;

revoke all on function public.subscribe_to_newsletter(text, text) from public;
grant execute on function public.subscribe_to_newsletter(text, text) to anon, authenticated;

comment on table public.newsletter_subscriptions is 'Audience subscriptions collected from public newsletter forms.';
