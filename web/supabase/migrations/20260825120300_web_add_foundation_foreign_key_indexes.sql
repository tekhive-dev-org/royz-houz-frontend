-- Royz Houz web foundation: supporting foreign-key indexes.
--
-- Ownership: web/supabase/migrations
-- PostgreSQL does not automatically index referencing foreign-key columns.
-- These additive indexes protect user-deletion/update paths and support content
-- audit queries without changing any table data.

-- Core website content actor foreign keys.
create index site_settings_created_by_idx on public.site_settings (created_by);
create index site_settings_updated_by_idx on public.site_settings (updated_by);
create index footer_sections_created_by_idx on public.footer_sections (created_by);
create index footer_sections_updated_by_idx on public.footer_sections (updated_by);
create index footer_links_created_by_idx on public.footer_links (created_by);
create index footer_links_updated_by_idx on public.footer_links (updated_by);
create index social_links_created_by_idx on public.social_links (created_by);
create index social_links_updated_by_idx on public.social_links (updated_by);
create index homepage_sections_created_by_idx on public.homepage_sections (created_by);
create index homepage_sections_updated_by_idx on public.homepage_sections (updated_by);
create index about_sections_created_by_idx on public.about_sections (created_by);
create index about_sections_updated_by_idx on public.about_sections (updated_by);
create index talents_created_by_idx on public.talents (created_by);
create index talents_updated_by_idx on public.talents (updated_by);
create index talent_categories_created_by_idx on public.talent_categories (created_by);
create index talent_categories_updated_by_idx on public.talent_categories (updated_by);
create index talent_category_assignments_created_by_idx on public.talent_category_assignments (created_by);
create index events_created_by_idx on public.events (created_by);
create index events_updated_by_idx on public.events (updated_by);
create index event_categories_created_by_idx on public.event_categories (created_by);
create index event_categories_updated_by_idx on public.event_categories (updated_by);
create index event_category_assignments_created_by_idx on public.event_category_assignments (created_by);

-- Editorial, media, submission, and SEO actor foreign keys.
create index blog_authors_created_by_idx on public.blog_authors (created_by);
create index blog_authors_updated_by_idx on public.blog_authors (updated_by);
create index blog_categories_created_by_idx on public.blog_categories (created_by);
create index blog_categories_updated_by_idx on public.blog_categories (updated_by);
create index blog_posts_created_by_idx on public.blog_posts (created_by);
create index blog_posts_updated_by_idx on public.blog_posts (updated_by);
create index blog_post_categories_created_by_idx on public.blog_post_categories (created_by);
create index blog_comments_created_by_idx on public.blog_comments (created_by);
create index blog_comments_updated_by_idx on public.blog_comments (updated_by);
create index media_assets_created_by_idx on public.media_assets (created_by);
create index media_assets_updated_by_idx on public.media_assets (updated_by);
create index media_collections_created_by_idx on public.media_collections (created_by);
create index media_collections_updated_by_idx on public.media_collections (updated_by);
create index media_collection_items_created_by_idx on public.media_collection_items (created_by);
create index donation_campaigns_created_by_idx on public.donation_campaigns (created_by);
create index donation_campaigns_updated_by_idx on public.donation_campaigns (updated_by);
create index donation_records_created_by_idx on public.donation_records (created_by);
create index donation_records_updated_by_idx on public.donation_records (updated_by);
create index contact_submissions_created_by_idx on public.contact_submissions (created_by);
create index contact_submissions_updated_by_idx on public.contact_submissions (updated_by);
create index join_applications_created_by_idx on public.join_applications (created_by);
create index join_applications_updated_by_idx on public.join_applications (updated_by);
create index seo_metadata_created_by_idx on public.seo_metadata (created_by);
create index seo_metadata_updated_by_idx on public.seo_metadata (updated_by);
