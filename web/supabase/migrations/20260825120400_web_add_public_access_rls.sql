-- Royz Houz web foundation: Row-Level Security and safe public access.
--
-- Ownership: web/supabase/migrations
-- This additive migration defines browser-safe read paths and narrowly scoped
-- anonymous submission functions. It does not modify existing data and creates
-- no merchandise, inventory, cart, order, checkout, or payment objects.

-- Lock down the application schema before exposing SECURITY DEFINER RPCs. All
-- table references inside those functions are schema-qualified, so public is
-- deliberately excluded from their search path to prevent object shadowing.
revoke create on schema public from public, anon, authenticated;

-- Prevent direct table writes by public roles. The service-role server/API
-- layer bypasses RLS for authorized operational work; public form submissions
-- use the explicitly scoped functions below instead of direct INSERT grants.
revoke all on table
  public.site_settings,
  public.navigation_items,
  public.footer_sections,
  public.footer_links,
  public.social_links,
  public.homepage_sections,
  public.about_sections,
  public.talents,
  public.talent_categories,
  public.talent_category_assignments,
  public.events,
  public.event_categories,
  public.event_category_assignments,
  public.blog_authors,
  public.blog_categories,
  public.blog_posts,
  public.blog_post_categories,
  public.blog_comments,
  public.media_assets,
  public.media_collections,
  public.media_collection_items,
  public.donation_campaigns,
  public.donation_records,
  public.contact_submissions,
  public.join_applications,
  public.seo_metadata
from anon, authenticated;

-- Published content may be read only after its publication timestamp. Draft,
-- scheduled, archived, and prematurely timestamped records remain invisible.
create policy site_settings_public_read_published
  on public.site_settings for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy navigation_items_public_read_published
  on public.navigation_items for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy footer_sections_public_read_published
  on public.footer_sections for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy footer_links_public_read_published
  on public.footer_links for select to anon, authenticated
  using (
    status = 'published' and published_at is not null and published_at <= timezone('utc', now())
    and exists (
      select 1
      from public.footer_sections section
      where section.id = footer_section_id
        and section.status = 'published'
        and section.published_at is not null
        and section.published_at <= timezone('utc', now())
    )
  );

create policy social_links_public_read_published
  on public.social_links for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy homepage_sections_public_read_published
  on public.homepage_sections for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy about_sections_public_read_published
  on public.about_sections for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy talents_public_read_published
  on public.talents for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy talent_categories_public_read_published
  on public.talent_categories for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy talent_category_assignments_public_read_published
  on public.talent_category_assignments for select to anon, authenticated
  using (
    exists (
      select 1 from public.talents talent
      where talent.id = talent_id
        and talent.status = 'published'
        and talent.published_at is not null
        and talent.published_at <= timezone('utc', now())
    )
    and exists (
      select 1 from public.talent_categories category
      where category.id = talent_category_id
        and category.status = 'published'
        and category.published_at is not null
        and category.published_at <= timezone('utc', now())
    )
  );

create policy events_public_read_published
  on public.events for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy event_categories_public_read_published
  on public.event_categories for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy event_category_assignments_public_read_published
  on public.event_category_assignments for select to anon, authenticated
  using (
    exists (
      select 1 from public.events event
      where event.id = event_id
        and event.status = 'published'
        and event.published_at is not null
        and event.published_at <= timezone('utc', now())
    )
    and exists (
      select 1 from public.event_categories category
      where category.id = event_category_id
        and category.status = 'published'
        and category.published_at is not null
        and category.published_at <= timezone('utc', now())
    )
  );

create policy blog_authors_public_read_published
  on public.blog_authors for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy blog_categories_public_read_published
  on public.blog_categories for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy blog_posts_public_read_published
  on public.blog_posts for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy blog_post_categories_public_read_published
  on public.blog_post_categories for select to anon, authenticated
  using (
    exists (
      select 1 from public.blog_posts post
      where post.id = blog_post_id
        and post.status = 'published'
        and post.published_at is not null
        and post.published_at <= timezone('utc', now())
    )
    and exists (
      select 1 from public.blog_categories category
      where category.id = blog_category_id
        and category.status = 'published'
        and category.published_at is not null
        and category.published_at <= timezone('utc', now())
    )
  );

-- blog_comments intentionally receives no direct SELECT policy because the
-- table contains private author_email values. Safe public projection is exposed
-- below through public.get_published_blog_comments().

create policy media_assets_public_read_published
  on public.media_assets for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy media_collections_public_read_published
  on public.media_collections for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

create policy media_collection_items_public_read_published
  on public.media_collection_items for select to anon, authenticated
  using (
    exists (
      select 1 from public.media_collections collection
      where collection.id = media_collection_id
        and collection.status = 'published'
        and collection.published_at is not null
        and collection.published_at <= timezone('utc', now())
    )
    and exists (
      select 1 from public.media_assets asset
      where asset.id = media_asset_id
        and asset.status = 'published'
        and asset.published_at is not null
        and asset.published_at <= timezone('utc', now())
    )
  );

create policy donation_campaigns_public_read_published
  on public.donation_campaigns for select to anon, authenticated
  using (status = 'published' and published_at is not null and published_at <= timezone('utc', now()));

-- SEO records may be read only when their explicit target is publicly visible.
create policy seo_metadata_public_read_for_published_target
  on public.seo_metadata for select to anon, authenticated
  using (
    exists (
      select 1 from public.site_settings settings
      where settings.id = site_settings_id
        and settings.status = 'published'
        and settings.published_at is not null
        and settings.published_at <= timezone('utc', now())
    )
    or exists (
      select 1 from public.homepage_sections section
      where section.id = homepage_section_id
        and section.status = 'published'
        and section.published_at is not null
        and section.published_at <= timezone('utc', now())
    )
    or exists (
      select 1 from public.about_sections section
      where section.id = about_section_id
        and section.status = 'published'
        and section.published_at is not null
        and section.published_at <= timezone('utc', now())
    )
    or exists (
      select 1 from public.talents talent
      where talent.id = talent_id
        and talent.status = 'published'
        and talent.published_at is not null
        and talent.published_at <= timezone('utc', now())
    )
    or exists (
      select 1 from public.events event
      where event.id = event_id
        and event.status = 'published'
        and event.published_at is not null
        and event.published_at <= timezone('utc', now())
    )
    or exists (
      select 1 from public.blog_posts post
      where post.id = blog_post_id
        and post.status = 'published'
        and post.published_at is not null
        and post.published_at <= timezone('utc', now())
    )
    or exists (
      select 1 from public.media_collections collection
      where collection.id = media_collection_id
        and collection.status = 'published'
        and collection.published_at is not null
        and collection.published_at <= timezone('utc', now())
    )
    or exists (
      select 1 from public.donation_campaigns campaign
      where campaign.id = donation_campaign_id
        and campaign.status = 'published'
        and campaign.published_at is not null
        and campaign.published_at <= timezone('utc', now())
    )
  );

-- Read grants pair with the policies above. No INSERT, UPDATE, or DELETE grant
-- is provided to anon/authenticated for CMS content or protected submissions.
grant usage on schema public to anon, authenticated;

grant select on table
  public.site_settings,
  public.navigation_items,
  public.footer_sections,
  public.footer_links,
  public.social_links,
  public.homepage_sections,
  public.about_sections,
  public.talents,
  public.talent_categories,
  public.talent_category_assignments,
  public.events,
  public.event_categories,
  public.event_category_assignments,
  public.blog_authors,
  public.blog_categories,
  public.blog_posts,
  public.blog_post_categories,
  public.media_assets,
  public.media_collections,
  public.media_collection_items,
  public.donation_campaigns,
  public.seo_metadata
to anon, authenticated;

-- Safe public submission: contact form only accepts the current, explicit form
-- fields and always creates a pending record. Internal status/audit fields are
-- not accepted from the caller.
create or replace function public.submit_contact_submission(
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_country_code text,
  p_reason text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  submission_id uuid;
begin
  if char_length(trim(coalesce(p_first_name, ''))) not between 1 and 100 then
    raise exception 'first_name must contain between 1 and 100 characters';
  end if;

  if char_length(trim(coalesce(p_last_name, ''))) > 100 then
    raise exception 'last_name must contain at most 100 characters';
  end if;

  if char_length(trim(coalesce(p_phone, ''))) > 50 then
    raise exception 'phone must contain at most 50 characters';
  end if;

  if char_length(trim(coalesce(p_reason, ''))) > 160 then
    raise exception 'reason must contain at most 160 characters';
  end if;

  if char_length(trim(coalesce(p_email, ''))) > 254
    or coalesce(p_email, '') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'email must be a valid email address';
  end if;

  if char_length(trim(coalesce(p_message, ''))) not between 1 and 600 then
    raise exception 'message must contain between 1 and 600 characters';
  end if;

  if p_country_code is not null and p_country_code !~ '^[A-Z]{2}$' then
    raise exception 'country_code must be a two-letter uppercase code';
  end if;

  insert into public.contact_submissions (
    first_name,
    last_name,
    email,
    phone,
    country_code,
    reason,
    message,
    status
  )
  values (
    trim(p_first_name),
    nullif(trim(p_last_name), ''),
    lower(trim(p_email)),
    nullif(trim(p_phone), ''),
    p_country_code,
    nullif(trim(p_reason), ''),
    trim(p_message),
    'pending'
  )
  returning id into submission_id;

  return submission_id;
end;
$$;

-- Safe public submission: the join form can supply only explicit applicant
-- fields. Reference/status/audit fields are generated server-side.
create or replace function public.submit_join_application(
  p_full_name text,
  p_stage_name text,
  p_email text,
  p_phone text,
  p_date_of_birth date,
  p_state_region text,
  p_talent_category text,
  p_custom_talent_category text,
  p_experience_level text,
  p_years_of_experience text,
  p_short_bio text,
  p_genres_specialties text,
  p_social_profiles jsonb,
  p_portfolio_urls jsonb,
  p_availability jsonb,
  p_additional_details jsonb,
  p_confirmed_accuracy boolean
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  application_id uuid;
  application_reference text;
begin
  if char_length(trim(coalesce(p_full_name, ''))) not between 1 and 160 then
    raise exception 'full_name must contain between 1 and 160 characters';
  end if;

  if char_length(trim(coalesce(p_email, ''))) > 254
    or coalesce(p_email, '') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'email must be a valid email address';
  end if;

  if char_length(trim(coalesce(p_phone, ''))) not between 3 and 50 then
    raise exception 'phone must contain between 3 and 50 characters';
  end if;

  if char_length(trim(coalesce(p_stage_name, ''))) > 160
    or char_length(trim(coalesce(p_state_region, ''))) > 160
    or char_length(trim(coalesce(p_talent_category, ''))) > 100
    or char_length(trim(coalesce(p_custom_talent_category, ''))) > 100
    or char_length(trim(coalesce(p_experience_level, ''))) > 100
    or char_length(trim(coalesce(p_years_of_experience, ''))) > 100
    or char_length(trim(coalesce(p_genres_specialties, ''))) > 500 then
    raise exception 'optional applicant text fields exceed their permitted length';
  end if;

  if char_length(trim(coalesce(p_talent_category, ''))) = 0 then
    raise exception 'talent_category is required';
  end if;

  if lower(trim(p_talent_category)) = 'custom'
    and char_length(trim(coalesce(p_custom_talent_category, ''))) = 0 then
    raise exception 'custom_talent_category is required when talent_category is custom';
  end if;

  if char_length(trim(coalesce(p_short_bio, ''))) not between 1 and 500 then
    raise exception 'short_bio must contain between 1 and 500 characters';
  end if;

  if coalesce(jsonb_typeof(p_social_profiles), '') <> 'array'
    or coalesce(jsonb_typeof(p_portfolio_urls), '') <> 'array'
    or coalesce(jsonb_typeof(p_availability), '') <> 'object'
    or coalesce(jsonb_typeof(p_additional_details), '') <> 'object' then
    raise exception 'social_profiles and portfolio_urls must be arrays; availability and additional_details must be objects';
  end if;

  if jsonb_array_length(p_social_profiles) > 10
    or jsonb_array_length(p_portfolio_urls) > 10
    or octet_length(p_social_profiles::text) > 16384
    or octet_length(p_portfolio_urls::text) > 16384
    or octet_length(p_availability::text) > 8192
    or octet_length(p_additional_details::text) > 16384 then
    raise exception 'application JSON payload exceeds permitted item or size limits';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_social_profiles) profile
    where jsonb_typeof(profile) <> 'object'
      or not (profile ? 'platform' and profile ? 'url')
      or jsonb_typeof(profile -> 'platform') <> 'string'
      or jsonb_typeof(profile -> 'url') <> 'string'
      or char_length(trim(profile ->> 'platform')) not between 1 and 64
      or char_length(trim(profile ->> 'url')) > 2048
      or trim(profile ->> 'url') !~ '^https:\/\/'
      or (profile ? 'id' and (jsonb_typeof(profile -> 'id') <> 'string' or char_length(profile ->> 'id') > 100))
  ) then
    raise exception 'social_profiles must contain platform and HTTPS url fields only';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_portfolio_urls) portfolio_url
    where jsonb_typeof(portfolio_url) <> 'string'
      or char_length(trim(portfolio_url #>> '{}')) not between 1 and 2048
      or trim(portfolio_url #>> '{}') !~ '^https:\/\/'
  ) then
    raise exception 'portfolio_urls must contain HTTPS URLs only';
  end if;

  if exists (
    select 1 from jsonb_object_keys(p_availability) key
    where key not in (
      'interestedInBookings', 'opportunities', 'generalAvailability',
      'preferredEngagement', 'workLocations'
    )
  )
    or (p_availability ? 'interestedInBookings' and jsonb_typeof(p_availability -> 'interestedInBookings') <> 'string')
    or (p_availability ? 'generalAvailability' and jsonb_typeof(p_availability -> 'generalAvailability') <> 'string')
    or (p_availability ? 'preferredEngagement' and jsonb_typeof(p_availability -> 'preferredEngagement') <> 'string')
    or (p_availability ? 'opportunities' and jsonb_typeof(p_availability -> 'opportunities') <> 'array')
    or (p_availability ? 'workLocations' and jsonb_typeof(p_availability -> 'workLocations') <> 'array') then
    raise exception 'availability contains unsupported keys or invalid value types';
  end if;

  if p_availability ? 'opportunities' and exists (
    select 1 from jsonb_array_elements(p_availability -> 'opportunities') item
    where jsonb_typeof(item) <> 'string' or char_length(item #>> '{}') not between 1 and 100
  ) then
    raise exception 'availability.opportunities must contain bounded string values';
  end if;

  if p_availability ? 'workLocations' and exists (
    select 1 from jsonb_array_elements(p_availability -> 'workLocations') item
    where jsonb_typeof(item) <> 'string' or char_length(item #>> '{}') not between 1 and 100
  ) then
    raise exception 'availability.workLocations must contain bounded string values';
  end if;

  if exists (
    select 1 from jsonb_object_keys(p_additional_details) key
    where key not in ('languages', 'equipmentResources', 'achievements', 'references')
  )
    or (p_additional_details ? 'languages' and jsonb_typeof(p_additional_details -> 'languages') <> 'string')
    or (p_additional_details ? 'equipmentResources' and jsonb_typeof(p_additional_details -> 'equipmentResources') <> 'string')
    or (p_additional_details ? 'references' and jsonb_typeof(p_additional_details -> 'references') <> 'string')
    or (p_additional_details ? 'achievements' and jsonb_typeof(p_additional_details -> 'achievements') <> 'array') then
    raise exception 'additional_details contains unsupported keys or invalid value types';
  end if;

  if p_additional_details ? 'achievements' and exists (
    select 1 from jsonb_array_elements(p_additional_details -> 'achievements') item
    where jsonb_typeof(item) <> 'string' or char_length(item #>> '{}') not between 1 and 500
  ) then
    raise exception 'additional_details.achievements must contain bounded string values';
  end if;

  if not coalesce(p_confirmed_accuracy, false) then
    raise exception 'confirmed_accuracy must be true';
  end if;

  application_reference := 'RH-APP-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.join_applications (
    reference,
    full_name,
    stage_name,
    email,
    phone,
    date_of_birth,
    state_region,
    talent_category,
    custom_talent_category,
    experience_level,
    years_of_experience,
    short_bio,
    genres_specialties,
    social_profiles,
    portfolio_urls,
    availability,
    additional_details,
    accuracy_confirmed_at,
    status
  )
  values (
    application_reference,
    trim(p_full_name),
    nullif(trim(p_stage_name), ''),
    lower(trim(p_email)),
    trim(p_phone),
    p_date_of_birth,
    nullif(trim(p_state_region), ''),
    lower(trim(p_talent_category)),
    nullif(trim(p_custom_talent_category), ''),
    nullif(trim(p_experience_level), ''),
    nullif(trim(p_years_of_experience), ''),
    trim(p_short_bio),
    nullif(trim(p_genres_specialties), ''),
    p_social_profiles,
    p_portfolio_urls,
    p_availability,
    p_additional_details,
    timezone('utc', now()),
    'pending'
  )
  returning id into application_id;

  return application_id;
end;
$$;

-- Blog comments enter moderation as pending. Parent replies are accepted only
-- for an already approved, publicly visible comment on the same published post.
create or replace function public.submit_blog_comment(
  p_blog_post_id uuid,
  p_parent_comment_id uuid,
  p_author_name text,
  p_author_email text,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, pg_temp
as $$
declare
  comment_id uuid;
begin
  if not exists (
    select 1 from public.blog_posts post
    where post.id = p_blog_post_id
      and post.status = 'published'
      and post.published_at is not null
      and post.published_at <= timezone('utc', now())
  ) then
    raise exception 'blog post is not available for comments';
  end if;

  if p_parent_comment_id is not null and not exists (
    select 1 from public.blog_comments parent
    where parent.id = p_parent_comment_id
      and parent.blog_post_id = p_blog_post_id
      and parent.status = 'approved'
      and parent.published_at is not null
      and parent.published_at <= timezone('utc', now())
  ) then
    raise exception 'parent comment is not available';
  end if;

  if char_length(trim(coalesce(p_author_name, ''))) not between 1 and 160 then
    raise exception 'author_name must contain between 1 and 160 characters';
  end if;

  if char_length(trim(coalesce(p_author_email, ''))) > 254
    or coalesce(p_author_email, '') !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'author_email must be a valid email address';
  end if;

  if char_length(trim(coalesce(p_body, ''))) not between 1 and 5000 then
    raise exception 'body must contain between 1 and 5000 characters';
  end if;

  insert into public.blog_comments (
    blog_post_id,
    parent_comment_id,
    author_name,
    author_email,
    body,
    status
  )
  values (
    p_blog_post_id,
    p_parent_comment_id,
    trim(p_author_name),
    lower(trim(p_author_email)),
    trim(p_body),
    'pending'
  )
  returning id into comment_id;

  return comment_id;
end;
$$;

-- This safe projection deliberately excludes author_email, audit IDs, and any
-- future internal moderation data. The base table is never granted to anon.
create or replace function public.get_published_blog_comments(p_blog_post_id uuid)
returns table (
  id uuid,
  blog_post_id uuid,
  parent_comment_id uuid,
  author_name text,
  body text,
  published_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog, pg_temp
as $$
  select
    comment.id,
    comment.blog_post_id,
    comment.parent_comment_id,
    comment.author_name,
    comment.body,
    comment.published_at,
    comment.created_at
  from public.blog_comments comment
  join public.blog_posts post on post.id = comment.blog_post_id
  where comment.blog_post_id = p_blog_post_id
    and comment.status = 'approved'
    and comment.published_at is not null
    and comment.published_at <= timezone('utc', now())
    and post.status = 'published'
    and post.published_at is not null
    and post.published_at <= timezone('utc', now())
  order by comment.created_at asc;
$$;

-- Published views provide stable, narrow public read surfaces for the primary
-- content adapters. security_invoker ensures the underlying RLS policies still
-- apply; explicit filters provide defense in depth.
create or replace view public.published_homepage_content
with (security_invoker = true)
as
  select id, slug, title, summary, body, sort_order, featured, published_at
  from public.homepage_sections
  where status = 'published'
    and published_at is not null
    and published_at <= timezone('utc', now())
  order by sort_order asc, published_at desc;

create or replace view public.published_events
with (security_invoker = true)
as
  select id, slug, title, summary, body, starts_at, ends_at, timezone,
    venue_name, venue_address, featured, sort_order, published_at
  from public.events
  where status = 'published'
    and published_at is not null
    and published_at <= timezone('utc', now())
  order by starts_at asc nulls last, sort_order asc;

create or replace view public.published_blog_posts
with (security_invoker = true)
as
  select post.id, post.slug, post.title, post.summary, post.body,
    post.blog_author_id, post.featured, post.sort_order, post.published_at
  from public.blog_posts post
  where post.status = 'published'
    and post.published_at is not null
    and post.published_at <= timezone('utc', now())
  order by post.published_at desc, post.sort_order asc;

create or replace view public.published_media
with (security_invoker = true)
as
  select id, slug, title, summary, media_source, media_type, url, secure_url,
    cloudinary_public_id, cloudinary_resource_type, format, width, height,
    duration_seconds, file_size_bytes, youtube_original_url, youtube_video_id,
    youtube_embed_url, youtube_thumbnail_url, alt_text, caption, body,
    featured, sort_order, published_at
  from public.media_assets
  where status = 'published'
    and published_at is not null
    and published_at <= timezone('utc', now())
  order by sort_order asc, published_at desc;

create or replace view public.published_talents
with (security_invoker = true)
as
  select id, slug, title, summary, body, location, featured, sort_order, published_at
  from public.talents
  where status = 'published'
    and published_at is not null
    and published_at <= timezone('utc', now())
  order by featured desc, sort_order asc, published_at desc;

create or replace view public.public_site_settings
with (security_invoker = true)
as
  select id, slug, title, summary, content, featured, sort_order, published_at
  from public.site_settings
  where status = 'published'
    and published_at is not null
    and published_at <= timezone('utc', now())
  order by sort_order asc, published_at desc;

revoke all on function public.submit_contact_submission(text, text, text, text, text, text, text) from public;
revoke all on function public.submit_join_application(text, text, text, text, date, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, boolean) from public;
revoke all on function public.submit_blog_comment(uuid, uuid, text, text, text) from public;
revoke all on function public.get_published_blog_comments(uuid) from public;

grant execute on function public.submit_contact_submission(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.submit_join_application(text, text, text, text, date, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, boolean) to anon, authenticated;
grant execute on function public.submit_blog_comment(uuid, uuid, text, text, text) to anon, authenticated;
grant execute on function public.get_published_blog_comments(uuid) to anon, authenticated;

grant select on
  public.published_homepage_content,
  public.published_events,
  public.published_blog_posts,
  public.published_media,
  public.published_talents,
  public.public_site_settings
to anon, authenticated;

comment on function public.submit_contact_submission(text, text, text, text, text, text, text) is
  'Public contact submission boundary. It accepts explicit form fields only and always stores a pending record.';
comment on function public.submit_join_application(text, text, text, text, date, text, text, text, text, text, text, text, jsonb, jsonb, jsonb, jsonb, boolean) is
  'Public join application boundary. It accepts explicit applicant fields only and generates protected status/reference values.';
comment on function public.submit_blog_comment(uuid, uuid, text, text, text) is
  'Public blog comment boundary. It always creates a pending comment for moderation.';
comment on function public.get_published_blog_comments(uuid) is
  'Safe public comment projection that omits private email addresses and internal fields.';
