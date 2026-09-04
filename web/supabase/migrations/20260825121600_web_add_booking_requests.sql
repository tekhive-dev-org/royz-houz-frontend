-- Royz Houz web foundation: protected Talent booking requests.
--
-- Booking is an inquiry workflow only. No payment, checkout, or provider
-- confirmation is stored here. Public browsers submit through the web API.

create table public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  submission_key uuid not null unique,
  reference text not null unique check (reference ~ '^RH-BOOK-[A-Z0-9]{10}$'),
  talent_id uuid not null references public.talents(id) on delete restrict,
  talent_slug_snapshot text not null check (talent_slug_snapshot ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  talent_name_snapshot text not null check (char_length(trim(talent_name_snapshot)) between 1 and 200),
  first_name text not null check (char_length(trim(first_name)) between 1 and 100),
  last_name text not null check (char_length(trim(last_name)) between 1 and 100),
  email text not null check (
    char_length(trim(email)) between 3 and 254
    and email = lower(email)
    and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
  ),
  phone text not null check (char_length(trim(phone)) between 3 and 50),
  event_type text not null check (char_length(trim(event_type)) between 1 and 160),
  event_date date not null,
  event_location text not null check (char_length(trim(event_location)) between 1 and 300),
  event_description text not null check (char_length(trim(event_description)) between 1 and 3000),
  budget text check (budget is null or char_length(trim(budget)) <= 100),
  workflow_status text not null default 'new' check (
    workflow_status in ('new', 'reviewing', 'contacted', 'confirmed', 'declined', 'cancelled', 'archived')
  ),
  internal_notes text check (internal_notes is null or char_length(internal_notes) <= 5000),
  assigned_to uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index booking_requests_talent_created_idx on public.booking_requests (talent_id, created_at desc);
create index booking_requests_status_created_idx on public.booking_requests (workflow_status, created_at desc);
create index booking_requests_email_created_idx on public.booking_requests (email, created_at desc);
create index booking_requests_assigned_to_idx on public.booking_requests (assigned_to) where assigned_to is not null;

create trigger booking_requests_set_updated_at before update on public.booking_requests
  for each row execute function public.set_updated_at();

alter table public.booking_requests enable row level security;
revoke all on table public.booking_requests from public, anon, authenticated;

comment on table public.booking_requests is
  'Private booking inquiries. This is not a payment or order table; public users cannot read or update requests.';
comment on column public.booking_requests.submission_key is
  'Client-generated idempotency key used to safely retry a booking submission.';
comment on column public.booking_requests.internal_notes is
  'Private administrative notes; never exposed by public APIs.';

create or replace function public.submit_booking_request(
  p_submission_key uuid,
  p_talent_id uuid,
  p_talent_slug text,
  p_talent_name text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_event_type text,
  p_event_date date,
  p_event_location text,
  p_event_description text,
  p_budget text default null,
  p_agreed_to_terms boolean default false
)
returns table (id uuid, reference text)
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  request_id uuid;
  booking_reference text;
  target_exists boolean;
begin
  if p_submission_key is null or p_talent_id is null or p_agreed_to_terms is not true
    or p_talent_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
    or char_length(trim(coalesce(p_talent_name, ''))) not between 1 and 200
    or char_length(trim(coalesce(p_first_name, ''))) not between 1 and 100
    or char_length(trim(coalesce(p_last_name, ''))) not between 1 and 100
    or char_length(trim(coalesce(p_email, ''))) not between 3 and 254
    or lower(trim(p_email)) !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
    or char_length(trim(coalesce(p_phone, ''))) not between 3 and 50
    or char_length(trim(coalesce(p_event_type, ''))) not between 1 and 160
    or p_event_date is null
    or char_length(trim(coalesce(p_event_location, ''))) not between 1 and 300
    or char_length(trim(coalesce(p_event_description, ''))) not between 1 and 3000
    or char_length(trim(coalesce(p_budget, ''))) > 100 then
    raise exception 'invalid booking request input';
  end if;

  select exists (
    select 1 from public.talents talent
    where talent.id = p_talent_id
      and talent.slug = p_talent_slug
      and talent.title = p_talent_name
      and talent.status = 'published'
      and talent.published_at is not null
      and talent.published_at <= timezone('utc', now())
      and lower(coalesce(
        talent.body ->> 'availableForBooking',
        talent.body ->> 'isAvailable',
        talent.body ->> 'availability',
        'available for booking'
      )) in ('true', 'available', 'available for booking', 'open')
  ) into target_exists;

  if not target_exists then
    raise exception 'booking talent is unavailable';
  end if;

  booking_reference := 'RH-BOOK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.booking_requests (
    submission_key, reference, talent_id, talent_slug_snapshot, talent_name_snapshot,
    first_name, last_name, email, phone, event_type, event_date, event_location,
    event_description, budget
  ) values (
    p_submission_key, booking_reference, p_talent_id, p_talent_slug, trim(p_talent_name),
    trim(p_first_name), trim(p_last_name), lower(trim(p_email)), trim(p_phone), trim(p_event_type),
    p_event_date, trim(p_event_location), trim(p_event_description), nullif(trim(coalesce(p_budget, '')), '')
  )
  on conflict (submission_key) do update set submission_key = excluded.submission_key
  returning booking_requests.id, booking_requests.reference into request_id, booking_reference;

  return query select request_id, booking_reference;
end;
$$;

revoke all on function public.submit_booking_request(uuid, uuid, text, text, text, text, text, text, text, date, text, text, text, boolean)
  from public, anon, authenticated;
grant execute on function public.submit_booking_request(uuid, uuid, text, text, text, text, text, text, text, date, text, text, text, boolean)
  to service_role;
