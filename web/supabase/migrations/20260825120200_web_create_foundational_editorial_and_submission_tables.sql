-- Royz Houz web foundation: blog, media, public submissions, and SEO metadata.
--
-- Ownership: web/supabase/migrations
-- This migration is additive. It contains no merchandise, products, inventory,
-- carts, orders, checkout, or payment provider objects.

-- Journal authors are separate from authenticated CMS users because public
-- author identity and biography are editorial content.
create table public.blog_authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint blog_authors_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint blog_authors_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint blog_authors_slug_unique unique (slug)
);

create table public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  sort_order integer not null default 0 check (sort_order >= 0),
  featured boolean not null default false,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint blog_categories_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint blog_categories_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint blog_categories_slug_unique unique (slug)
);

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  blog_author_id uuid references public.blog_authors(id) on delete set null,
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint blog_posts_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint blog_posts_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint blog_posts_slug_unique unique (slug)
);

create table public.blog_post_categories (
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  blog_category_id uuid not null references public.blog_categories(id) on delete restrict,
  is_primary boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  primary key (blog_post_id, blog_category_id)
);

create unique index blog_post_categories_one_primary_per_post
  on public.blog_post_categories (blog_post_id)
  where is_primary;

-- Comments are retained as public-submission records and must be explicitly
-- approved before publication. Anonymous submissions do not require auth user IDs.
create table public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  parent_comment_id uuid,
  author_user_id uuid references auth.users(id) on delete set null,
  author_name text not null check (char_length(trim(author_name)) between 1 and 160),
  author_email text check (author_email is null or author_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  body text not null check (char_length(trim(body)) between 1 and 5000),
  status public.review_status not null default 'pending',
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint blog_comments_approved_has_publication check (
    status <> 'approved' or published_at is not null
  ),
  constraint blog_comments_id_post_unique unique (id, blog_post_id),
  constraint blog_comments_parent_same_post foreign key (parent_comment_id, blog_post_id)
    references public.blog_comments (id, blog_post_id) on delete cascade
);

-- Media metadata references Cloudinary or YouTube. There is intentionally no
-- bytea/blob column and no upload payload: long files remain outside Supabase.
create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  media_source public.media_source not null,
  media_type public.media_type not null,
  url text,
  secure_url text,
  cloudinary_public_id text,
  cloudinary_resource_type text,
  format text,
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_seconds numeric(12, 3) check (duration_seconds is null or duration_seconds >= 0),
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  youtube_original_url text,
  youtube_video_id text,
  youtube_embed_url text,
  youtube_thumbnail_url text,
  alt_text text,
  caption text,
  body jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint media_assets_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint media_assets_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint media_assets_source_metadata check (
    (media_source = 'cloudinary' and char_length(trim(cloudinary_public_id)) > 0 and secure_url ~ '^https:\/\/') or
    (media_source = 'youtube' and youtube_original_url ~ '^https?:\/\/' and youtube_video_id ~ '^[A-Za-z0-9_-]{11}$' and youtube_embed_url ~ '^https:\/\/' and youtube_thumbnail_url ~ '^https:\/\/') or
    (media_source = 'external' and url ~ '^https?:\/\/')
  ),
  constraint media_assets_slug_unique unique (slug),
  constraint media_assets_youtube_video_id_unique unique (youtube_video_id),
  constraint media_assets_cloudinary_public_id_unique unique (cloudinary_public_id)
);

comment on table public.media_assets is
  'Web-owned Cloudinary/YouTube/external media metadata. This table stores references and metadata only; no binary media payload is permitted.';
comment on column public.media_assets.file_size_bytes is
  'Optional source metadata byte count, not binary media data.';

create table public.media_collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint media_collections_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint media_collections_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint media_collections_slug_unique unique (slug)
);

create table public.media_collection_items (
  media_collection_id uuid not null references public.media_collections(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete restrict,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  primary key (media_collection_id, media_asset_id),
  constraint media_collection_items_sort_unique unique (media_collection_id, sort_order)
);

-- Donation campaigns are public editorial configuration. Donation records are
-- protected contribution records only; no payment provider table is created.
create table public.donation_campaigns (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  summary text,
  body jsonb not null default '{}'::jsonb,
  featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  status public.content_status not null default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint donation_campaigns_slug_format check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' and char_length(slug) <= 160
  ),
  constraint donation_campaigns_status_dates check (
    (status <> 'scheduled' or scheduled_at is not null) and
    (status <> 'published' or published_at is not null)
  ),
  constraint donation_campaigns_slug_unique unique (slug)
);

create table public.donation_records (
  id uuid primary key default gen_random_uuid(),
  donation_campaign_id uuid references public.donation_campaigns(id) on delete restrict,
  reference text not null,
  donor_name text not null check (char_length(trim(donor_name)) between 1 and 160),
  donor_email text not null check (donor_email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  donor_phone text,
  amount numeric(14, 2) not null check (amount > 0),
  currency char(3) not null default 'NGN' check (currency ~ '^[A-Z]{3}$'),
  frequency text not null default 'one-time' check (frequency in ('one-time', 'monthly', 'sponsor')),
  status public.review_status not null default 'pending',
  approved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint donation_records_approved_at check (status <> 'approved' or approved_at is not null),
  constraint donation_records_reference_unique unique (reference)
);

comment on table public.donation_records is
  'Protected donation records. This foundational table intentionally contains no payment processor IDs, payment transaction state, or checkout data.';

-- Contact and join submissions are operational/PII-bearing records. They do
-- not have public slugs and remain inaccessible to direct anonymous reads.
create table public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(trim(first_name)) between 1 and 100),
  last_name text,
  email text not null check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text,
  country_code text check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  reason text,
  message text not null check (char_length(trim(message)) between 1 and 600),
  status public.review_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null
);

create table public.join_applications (
  id uuid primary key default gen_random_uuid(),
  reference text not null,
  full_name text not null check (char_length(trim(full_name)) between 1 and 160),
  stage_name text,
  email text not null check (email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  phone text not null check (char_length(trim(phone)) between 3 and 50),
  date_of_birth date,
  state_region text,
  talent_category text not null,
  custom_talent_category text,
  experience_level text,
  years_of_experience text,
  short_bio text not null check (char_length(trim(short_bio)) between 1 and 500),
  genres_specialties text,
  social_profiles jsonb not null default '[]'::jsonb,
  portfolio_urls jsonb not null default '[]'::jsonb,
  availability jsonb not null default '{}'::jsonb,
  additional_details jsonb not null default '{}'::jsonb,
  accuracy_confirmed_at timestamptz,
  status public.review_status not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint join_applications_reference_unique unique (reference),
  constraint join_applications_custom_category check (
    talent_category <> 'custom' or custom_talent_category is not null
  )
);

comment on table public.join_applications is
  'Protected talent join applications. Portfolio URLs may reference separately authorized private assets; binary uploads are not stored here.';

-- SEO is normalized with explicit nullable foreign keys rather than an
-- unenforced polymorphic relationship. Exactly one entity target is required.
create table public.seo_metadata (
  id uuid primary key default gen_random_uuid(),
  site_settings_id uuid references public.site_settings(id) on delete cascade,
  homepage_section_id uuid references public.homepage_sections(id) on delete cascade,
  about_section_id uuid references public.about_sections(id) on delete cascade,
  talent_id uuid references public.talents(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  blog_post_id uuid references public.blog_posts(id) on delete cascade,
  media_collection_id uuid references public.media_collections(id) on delete cascade,
  donation_campaign_id uuid references public.donation_campaigns(id) on delete cascade,
  title text,
  summary text,
  canonical_path text check (canonical_path is null or canonical_path ~ '^\/'),
  og_title text,
  og_description text,
  og_image_url text check (og_image_url is null or og_image_url ~ '^https?:\/\/'),
  no_index boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  constraint seo_metadata_exactly_one_target check (
    num_nonnulls(
      site_settings_id,
      homepage_section_id,
      about_section_id,
      talent_id,
      event_id,
      blog_post_id,
      media_collection_id,
      donation_campaign_id
    ) = 1
  ),
  constraint seo_metadata_site_settings_unique unique (site_settings_id),
  constraint seo_metadata_homepage_section_unique unique (homepage_section_id),
  constraint seo_metadata_about_section_unique unique (about_section_id),
  constraint seo_metadata_talent_unique unique (talent_id),
  constraint seo_metadata_event_unique unique (event_id),
  constraint seo_metadata_blog_post_unique unique (blog_post_id),
  constraint seo_metadata_media_collection_unique unique (media_collection_id),
  constraint seo_metadata_donation_campaign_unique unique (donation_campaign_id)
);

-- Lookup, lifecycle, publication, and foreign-key indexes.
create index blog_authors_status_published_at_idx on public.blog_authors (status, published_at desc);
create index blog_categories_status_published_at_idx on public.blog_categories (status, published_at desc);
create index blog_posts_author_id_idx on public.blog_posts (blog_author_id);
create index blog_posts_status_published_at_idx on public.blog_posts (status, published_at desc);
create index blog_posts_featured_sort_order_idx on public.blog_posts (featured desc, sort_order);
create index blog_post_categories_category_id_idx on public.blog_post_categories (blog_category_id);
create index blog_comments_post_id_status_published_at_idx on public.blog_comments (blog_post_id, status, published_at desc);
create index blog_comments_parent_comment_id_idx on public.blog_comments (parent_comment_id);
create index blog_comments_author_user_id_idx on public.blog_comments (author_user_id);
create index media_assets_status_published_at_idx on public.media_assets (status, published_at desc);
create index media_assets_source_type_idx on public.media_assets (media_source, media_type);
create index media_collections_status_published_at_idx on public.media_collections (status, published_at desc);
create index media_collection_items_asset_id_idx on public.media_collection_items (media_asset_id);
create index donation_campaigns_status_published_at_idx on public.donation_campaigns (status, published_at desc);
create index donation_records_campaign_id_idx on public.donation_records (donation_campaign_id);
create index donation_records_status_created_at_idx on public.donation_records (status, created_at desc);
create index contact_submissions_status_created_at_idx on public.contact_submissions (status, created_at desc);
create index join_applications_status_created_at_idx on public.join_applications (status, created_at desc);
create index seo_metadata_talent_id_idx on public.seo_metadata (talent_id);
create index seo_metadata_event_id_idx on public.seo_metadata (event_id);
create index seo_metadata_blog_post_id_idx on public.seo_metadata (blog_post_id);

-- Automatic updated_at maintenance for all mutable records.
create trigger blog_authors_set_updated_at before update on public.blog_authors
  for each row execute function public.set_updated_at();
create trigger blog_categories_set_updated_at before update on public.blog_categories
  for each row execute function public.set_updated_at();
create trigger blog_posts_set_updated_at before update on public.blog_posts
  for each row execute function public.set_updated_at();
create trigger blog_comments_set_updated_at before update on public.blog_comments
  for each row execute function public.set_updated_at();
create trigger media_assets_set_updated_at before update on public.media_assets
  for each row execute function public.set_updated_at();
create trigger media_collections_set_updated_at before update on public.media_collections
  for each row execute function public.set_updated_at();
create trigger donation_campaigns_set_updated_at before update on public.donation_campaigns
  for each row execute function public.set_updated_at();
create trigger donation_records_set_updated_at before update on public.donation_records
  for each row execute function public.set_updated_at();
create trigger contact_submissions_set_updated_at before update on public.contact_submissions
  for each row execute function public.set_updated_at();
create trigger join_applications_set_updated_at before update on public.join_applications
  for each row execute function public.set_updated_at();
create trigger seo_metadata_set_updated_at before update on public.seo_metadata
  for each row execute function public.set_updated_at();

-- Secure-by-default RLS. No direct browser policies are added until the public
-- API/service layer and authorization policy design are implemented.
alter table public.blog_authors enable row level security;
alter table public.blog_categories enable row level security;
alter table public.blog_posts enable row level security;
alter table public.blog_post_categories enable row level security;
alter table public.blog_comments enable row level security;
alter table public.media_assets enable row level security;
alter table public.media_collections enable row level security;
alter table public.media_collection_items enable row level security;
alter table public.donation_campaigns enable row level security;
alter table public.donation_records enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.join_applications enable row level security;
alter table public.seo_metadata enable row level security;
