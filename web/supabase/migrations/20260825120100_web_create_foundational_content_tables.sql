-- Royz Houz web foundation: public site, talent, and event content.
--
-- Ownership: web/supabase/migrations
-- This migration is additive and intentionally excludes all merchandise,
-- products, inventory, carts, orders, and payment objects.

-- Global settings are modeled as named records so configuration can evolve
-- without hard-coding public content in the application.
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  content jsonb not null default '{}'::jsonb,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint site_settings_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint site_settings_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint site_settings_slug_unique unique (slug)
);

comment on table public.site_settings is
  'Web-owned named public site configuration records; values are editor-managed JSON content, not credentials.';

create table public.navigation_items (
  id uuid primary key default gen_random_uuid(),
  label text not null check (char_length(trim(label)) > 0),
  href text not null check (href ~ '^(\/|https?:\/\/)'),
  placement text not null default 'header' check (placement in ('header', 'utility')),
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint navigation_items_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint navigation_items_placement_sort_unique unique (placement, sort_order)
);

comment on table public.navigation_items is
  'Public header and utility navigation records. Footer navigation is owned by footer_sections/footer_links.';

create table public.footer_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint footer_sections_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint footer_sections_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint footer_sections_slug_unique unique (slug),
  constraint footer_sections_sort_order_unique unique (sort_order)
);

create table public.footer_links (
  id uuid primary key default gen_random_uuid(),
  footer_section_id uuid not null references public.footer_sections(id) on delete cascade,
  label text not null check (char_length(trim(label)) > 0),
  href text not null check (href ~ '^(\/|https?:\/\/)'),
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint footer_links_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint footer_links_section_sort_unique unique (footer_section_id, sort_order)
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  url text not null check (url ~ '^https:\/\/'),
  placement text not null default 'global' check (placement in ('global', 'header', 'footer', 'contact')),
  label text,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint social_links_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint social_links_placement_platform_unique unique (placement, platform)
);

create table public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint homepage_sections_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint homepage_sections_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint homepage_sections_slug_unique unique (slug),
  constraint homepage_sections_sort_order_unique unique (sort_order)
);

create table public.about_sections (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint about_sections_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint about_sections_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint about_sections_slug_unique unique (slug),
  constraint about_sections_sort_order_unique unique (sort_order)
);

-- Talent profiles use a normalized category assignment table to support an
-- editorial primary category plus additional discoverability categories.
create table public.talents (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  location text,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint talents_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint talents_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint talents_slug_unique unique (slug)
);

create table public.talent_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint talent_categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint talent_categories_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint talent_categories_slug_unique unique (slug)
);

create table public.talent_category_assignments (
  talent_id uuid not null references public.talents(id) on delete cascade,
  talent_category_id uuid not null references public.talent_categories(id) on delete restrict,
  is_primary boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  primary key (talent_id, talent_category_id)
);

create unique index talent_category_assignments_one_primary_per_talent
  on public.talent_category_assignments (talent_id)
  where is_primary;

-- Events use a separate assignment table for multi-category listing/filtering.
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  timezone text,
  venue_name text,
  venue_address text,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint events_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint events_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint events_date_range check (ends_at is null or starts_at is null or ends_at >= starts_at),
  constraint events_slug_unique unique (slug)
);

create table public.event_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  featured boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint event_categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint event_categories_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint event_categories_slug_unique unique (slug)
);

create table public.event_category_assignments (
  event_id uuid not null references public.events(id) on delete cascade,
  event_category_id uuid not null references public.event_categories(id) on delete restrict,
  is_primary boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  primary key (event_id, event_category_id)
);

create unique index event_category_assignments_one_primary_per_event
  on public.event_category_assignments (event_id)
  where is_primary;

-- Indexes support public slug lookup, publication queries, lifecycle filters,
-- and all foreign-key joins.
create index site_settings_status_published_at_idx on public.site_settings (status, published_at desc);
create index navigation_items_status_published_at_idx on public.navigation_items (status, published_at desc);
create index navigation_items_created_by_idx on public.navigation_items (created_by);
create index navigation_items_updated_by_idx on public.navigation_items (updated_by);
create index footer_sections_status_published_at_idx on public.footer_sections (status, published_at desc);
create index footer_links_footer_section_id_idx on public.footer_links (footer_section_id);
create index footer_links_status_published_at_idx on public.footer_links (status, published_at desc);
create index social_links_status_published_at_idx on public.social_links (status, published_at desc);
create index homepage_sections_status_published_at_idx on public.homepage_sections (status, published_at desc);
create index about_sections_status_published_at_idx on public.about_sections (status, published_at desc);
create index talents_status_published_at_idx on public.talents (status, published_at desc);
create index talents_featured_sort_order_idx on public.talents (featured desc, sort_order);
create index talent_categories_status_published_at_idx on public.talent_categories (status, published_at desc);
create index talent_category_assignments_category_id_idx on public.talent_category_assignments (talent_category_id);
create index events_status_published_at_idx on public.events (status, published_at desc);
create index events_starts_at_idx on public.events (starts_at);
create index events_featured_sort_order_idx on public.events (featured desc, sort_order);
create index event_categories_status_published_at_idx on public.event_categories (status, published_at desc);
create index event_category_assignments_category_id_idx on public.event_category_assignments (event_category_id);

-- Maintain update timestamps consistently for mutable web-owned records.
create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger navigation_items_set_updated_at before update on public.navigation_items
  for each row execute function public.set_updated_at();
create trigger footer_sections_set_updated_at before update on public.footer_sections
  for each row execute function public.set_updated_at();
create trigger footer_links_set_updated_at before update on public.footer_links
  for each row execute function public.set_updated_at();
create trigger social_links_set_updated_at before update on public.social_links
  for each row execute function public.set_updated_at();
create trigger homepage_sections_set_updated_at before update on public.homepage_sections
  for each row execute function public.set_updated_at();
create trigger about_sections_set_updated_at before update on public.about_sections
  for each row execute function public.set_updated_at();
create trigger talents_set_updated_at before update on public.talents
  for each row execute function public.set_updated_at();
create trigger talent_categories_set_updated_at before update on public.talent_categories
  for each row execute function public.set_updated_at();
create trigger events_set_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger event_categories_set_updated_at before update on public.event_categories
  for each row execute function public.set_updated_at();

-- Enable Row-Level Security before any application data is introduced. Public
-- and admin policies will be added in a reviewed follow-up migration; until
-- then direct client access is denied by default.
alter table public.site_settings enable row level security;
alter table public.navigation_items enable row level security;
alter table public.footer_sections enable row level security;
alter table public.footer_links enable row level security;
alter table public.social_links enable row level security;
alter table public.homepage_sections enable row level security;
alter table public.about_sections enable row level security;
alter table public.talents enable row level security;
alter table public.talent_categories enable row level security;
alter table public.talent_category_assignments enable row level security;
alter table public.events enable row level security;
alter table public.event_categories enable row level security;
alter table public.event_category_assignments enable row level security;

comment on table public.talent_category_assignments is
  'Web-owned talent/category many-to-many relation with one optional primary category per talent.';
comment on table public.event_category_assignments is
  'Web-owned event/category many-to-many relation with one optional primary category per event.';
