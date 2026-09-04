-- Royz Houz representative LOCAL development seed data.
--
-- This file is intentionally separate from scripts/import-constants-to-supabase.mjs:
--   * This SQL seeds a small, safe, representative local dataset.
--   * The Node import script transforms a broader set of existing constants and
--     is dry-run by default; production writes require explicit confirmation.
--
-- All statements are idempotent through natural unique keys. No public form
-- submissions, join applications, donation records, merchandise, cart data,
-- generated demo media, or binary media files are seeded here.

begin;

-- Global and shared page configuration.
insert into public.site_settings (
  slug, title, summary, content, status, published_at, featured, sort_order
)
values (
  'global',
  'Royz Houz',
  $$Building Africa's next generation of creatives, leaders and innovators.$$,
  '{"brandName":"ROYZ HOUZ","logo":"/logo.png","socialLinks":["instagram","x","youtube","tiktok"]}'::jsonb,
  'published', timezone('utc', now()), true, 0
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  status = excluded.status,
  published_at = excluded.published_at,
  featured = excluded.featured,
  sort_order = excluded.sort_order;

insert into public.navigation_items (
  label, href, placement, sort_order, status, published_at
)
values
  ('Home', '/', 'header', 1, 'published', timezone('utc', now())),
  ('About Us', '/about', 'header', 2, 'published', timezone('utc', now())),
  ('Talent Hub', '/talents', 'header', 3, 'published', timezone('utc', now())),
  ('Events', '/events', 'header', 4, 'published', timezone('utc', now())),
  ('Media', '/media', 'header', 5, 'published', timezone('utc', now())),
  ('Blog', '/blog', 'header', 6, 'published', timezone('utc', now())),
  ('Contact', '/contact', 'header', 7, 'published', timezone('utc', now()))
on conflict (placement, sort_order) do update set
  label = excluded.label,
  href = excluded.href,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.footer_sections (
  slug, title, summary, content, sort_order, status, published_at
)
values
  ('explore', 'Explore', null, '{}'::jsonb, 1, 'published', timezone('utc', now())),
  ('community', 'Community', null, '{}'::jsonb, 2, 'published', timezone('utc', now()))
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.footer_links (footer_section_id, label, href, sort_order, status, published_at)
select section.id, link.label, link.href, link.sort_order, 'published', timezone('utc', now())
from public.footer_sections section
join (
  values
    ('explore', 'Home', '/', 1),
    ('explore', 'About Royz Houz', '/about', 2),
    ('explore', 'Talent Hub', '/talents', 3),
    ('community', 'Blog / Journal', '/blog', 1),
    ('community', 'Donate', '/donate', 2),
    ('community', 'Contact Us', '/contact', 3)
) as link(section_slug, label, href, sort_order)
  on link.section_slug = section.slug
on conflict (footer_section_id, sort_order) do update set
  label = excluded.label,
  href = excluded.href,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.social_links (platform, url, placement, label, sort_order, status, published_at)
values
  ('instagram', 'https://instagram.com', 'global', 'Instagram', 1, 'published', timezone('utc', now())),
  ('x', 'https://x.com', 'global', 'X', 2, 'published', timezone('utc', now())),
  ('youtube', 'https://youtube.com', 'global', 'YouTube', 3, 'published', timezone('utc', now()))
on conflict (placement, platform) do update set
  url = excluded.url,
  label = excluded.label,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

-- Homepage/About records preserve current component-facing copy and image paths
-- inside JSON content. No asset upload or Cloudinary migration occurs here.
insert into public.homepage_sections (
  slug, title, summary, body, sort_order, status, published_at, featured
)
values (
  'hero',
  $$Building Africa's Next Generation.$$,
  $$Discover, develop, and empower Africa's most extraordinary creatives.$$,
  '{"image":"/assets/img/home-hero.png","ctaPrimary":{"label":"Discover Talent","href":"/talents"},"ctaSecondary":{"label":"Explore Events","href":"/events"}}'::jsonb,
  1, 'published', timezone('utc', now()), true
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at,
  featured = excluded.featured;

insert into public.about_sections (
  slug, title, summary, body, sort_order, status, published_at
)
values
  (
    'mission-vision',
    'Mission and Vision',
    null,
    '{"cards":[{"id":"mission","title":"Our Mission","description":"To discover, develop, and empower creatives through meaningful opportunities, collaboration, and experiences that create positive change in communities.","iconKey":"mission"},{"id":"vision","title":"Our Vision","description":"To become a leading platform where aspiring creatives access opportunities, mentorship, and support that inspire growth, innovation, and lasting impact.","iconKey":"vision"}]}'::jsonb,
    1, 'published', timezone('utc', now())
  ),
  (
    'impact-metrics',
    'Impact Metrics',
    null,
    '{"metrics":[{"id":"talent-discovery","title":"Talent Discovery","percentage":94,"description":"Discover exceptional African creatives and connect with talented individuals whose skills, passion, and unique stories deserve to be seen."},{"id":"creative-development","title":"Creative Development","percentage":89,"description":"We support creatives with meaningful opportunities, guidance, and connections that help them develop their skills and grow their careers."}]}'::jsonb,
    2, 'published', timezone('utc', now())
  )
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

-- Representative talent taxonomy/profile. The component DTO remains in body
-- so a later adapter can preserve existing cards/profile tabs without UI changes.
insert into public.talent_categories (slug, title, sort_order, status, published_at)
values
  ('musicians', 'Musicians', 1, 'published', timezone('utc', now())),
  ('actors', 'Actors', 2, 'published', timezone('utc', now())),
  ('producers', 'Producers', 3, 'published', timezone('utc', now())),
  ('fashion-designers', 'Fashion Designers', 4, 'published', timezone('utc', now()))
on conflict (slug) do update set
  title = excluded.title,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.talents (
  slug, title, summary, body, location, featured, sort_order, status, published_at
)
values (
  'zara-diallo',
  'Zara Diallo',
  'Award-winning fashion designer and creative director.',
  '{"id":"zara-diallo","slug":"zara-diallo","name":"Zara Diallo","category":"Fashion Designer","categoryKey":"fashion-designers","badge":"TOP CREATIVE","subtitle":"Award-winning fashion designer and creative director.","bio":"Zara Diallo is an award-winning fashion designer and creative director known for blending contemporary silhouettes with African heritage.","rating":4.9,"reviewCount":127,"followers":"58K","bookingPrice":"₦350,000","image":"/assets/img/talents/zara.jpg","coverImage":"/assets/img/talents/producer-hero.jpg","isHot":true,"tabs":["About","Gallery","Videos"],"awards":["African Fashion Awards 2024"],"achievements":["Featured at Dakar Fashion Week"],"socials":{"instagram":"https://instagram.com","youtube":"https://youtube.com"}}'::jsonb,
  'Dakar, Senegal', true, 1, 'published', timezone('utc', now())
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  location = excluded.location,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.talent_category_assignments (
  talent_id, talent_category_id, is_primary, sort_order
)
select talent.id, category.id, true, 0
from public.talents talent
join public.talent_categories category on category.slug = 'fashion-designers'
where talent.slug = 'zara-diallo'
on conflict (talent_id, talent_category_id) do update set
  is_primary = excluded.is_primary,
  sort_order = excluded.sort_order;

-- Representative event/category while preserving display-date/image fields in body.
insert into public.event_categories (slug, title, sort_order, status, published_at)
values
  ('fashion-show', 'Fashion Show', 1, 'published', timezone('utc', now())),
  ('summit', 'Summit', 2, 'published', timezone('utc', now()))
on conflict (slug) do update set
  title = excluded.title,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.events (
  slug, title, summary, body, starts_at, timezone, venue_name, venue_address,
  featured, sort_order, status, published_at
)
values (
  'fashion-forward-abuja',
  'Fashion Forward: Abuja',
  $$Join Africa's premier fashion showcase highlighting creative innovation.$$,
  $event_body${"id":"fashion-forward-abuja","slug":"fashion-forward-abuja","day":"08","month":"Oct","year":"2026","location":"National Diamond Centre, Abuja, Central","description":"Join Africa's premier fashion showcase highlighting creative innovation.","category":"Fashion Show","image":"/assets/img/events/events-hero-bg.png","ticketLink":"/events/fashion-forward-abuja","isPopular":false}$event_body$::jsonb,
  '2026-10-08T00:00:00Z', 'Africa/Lagos',
  'National Diamond Centre', 'National Diamond Centre, Abuja, Central',
  true, 1, 'published', timezone('utc', now())
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  starts_at = excluded.starts_at,
  timezone = excluded.timezone,
  venue_name = excluded.venue_name,
  venue_address = excluded.venue_address,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.event_category_assignments (
  event_id, event_category_id, is_primary, sort_order
)
select event.id, category.id, true, 0
from public.events event
join public.event_categories category on category.slug = 'fashion-show'
where event.slug = 'fashion-forward-abuja'
on conflict (event_id, event_category_id) do update set
  is_primary = excluded.is_primary,
  sort_order = excluded.sort_order;

-- Representative journal data. The body column holds current display metadata
-- until a dedicated rich-text/article-body adapter is implemented.
insert into public.blog_authors (slug, title, summary, sort_order, status, published_at)
values ('stanley-lange', 'Stanley Lange', null, 1, 'published', timezone('utc', now()))
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.blog_categories (slug, title, sort_order, status, published_at)
values ('journal', 'Journal', 1, 'published', timezone('utc', now()))
on conflict (slug) do update set
  title = excluded.title,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.blog_posts (
  blog_author_id, slug, title, summary, body, featured, sort_order, status, published_at
)
select author.id,
  '5-strategies-for-building-a-sustainable-creative-career-in-africa',
  '5 Strategies for Building a Sustainable Creative Career in Africa',
  'Dive into the enchanting world of fall-inspired makeup trends. From warm hues to bold lip colors, discover the latest beauty trends that will elevate your autumn beauty routine.',
  '{"id":"5-strategies-for-building-a-sustainable-creative-career-in-africa","badge":"PREMIUM","format":"PODCAST","readTime":"5min read","date":"January 1, 2026","image":"/assets/img/blog/post-ballet.jpg"}'::jsonb,
  true, 1, 'published', timezone('utc', now())
from public.blog_authors author
where author.slug = 'stanley-lange'
on conflict (slug) do update set
  blog_author_id = excluded.blog_author_id,
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.blog_post_categories (
  blog_post_id, blog_category_id, is_primary, sort_order
)
select post.id, category.id, true, 0
from public.blog_posts post
join public.blog_categories category on category.slug = 'journal'
where post.slug = '5-strategies-for-building-a-sustainable-creative-career-in-africa'
on conflict (blog_post_id, blog_category_id) do update set
  is_primary = excluded.is_primary,
  sort_order = excluded.sort_order;

-- One valid YouTube metadata reference demonstrates the media model without
-- uploading or copying any asset. It is intentionally draft for editorial review.
insert into public.media_assets (
  slug, title, summary, media_source, media_type,
  youtube_original_url, youtube_video_id, youtube_embed_url, youtube_thumbnail_url,
  body, sort_order, status
)
values (
  'featured-hero-media-review',
  'Beyond the Stage: Stories of Resilience and Excellence.',
  'Review candidate from the existing media hero constant.',
  'youtube', 'video',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  '{"sourceConstant":"FEATURED_HERO_MEDIA","originalBackgroundImage":"/assets/img/talent-hero.jpg","requiresEditorialMediaReview":true}'::jsonb,
  1, 'draft'
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  sort_order = excluded.sort_order,
  status = excluded.status;

insert into public.media_collections (
  slug, title, summary, body, featured, sort_order, status, published_at
)
values (
  'media-review-candidates',
  'Media Review Candidates',
  'Local development review collection only.',
  '{"source":"web/constants/media.js","noAutomaticCloudinaryUpload":true}'::jsonb,
  false, 1, 'draft', null
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

insert into public.media_collection_items (media_collection_id, media_asset_id, sort_order)
select collection.id, asset.id, 1
from public.media_collections collection
join public.media_assets asset on asset.slug = 'featured-hero-media-review'
where collection.slug = 'media-review-candidates'
on conflict (media_collection_id, media_asset_id) do update set
  sort_order = excluded.sort_order;

insert into public.donation_campaigns (
  slug, title, summary, body, featured, sort_order, status, published_at
)
values (
  'career-skill-development',
  'Career Skill Development',
  'Support emerging creatives through career skill development.',
  '{"sourceConstant":"DonationForm.CAUSES","displayLabel":"Career skill development"}'::jsonb,
  true, 1, 'published', timezone('utc', now())
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  featured = excluded.featured,
  sort_order = excluded.sort_order,
  status = excluded.status,
  published_at = excluded.published_at;

-- No contact_submissions, join_applications, donation_records, or blog_comments
-- are seeded. Those tables contain operational/public-submission data only.
commit;
