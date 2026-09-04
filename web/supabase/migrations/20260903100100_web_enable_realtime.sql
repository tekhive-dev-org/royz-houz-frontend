-- Realtime is used as a change signal only. Clients refetch through existing
-- public API routes, so database payloads are never treated as the read model.

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'site_settings', 'navigation_items', 'footer_sections', 'footer_links',
    'social_links', 'homepage_sections', 'about_sections', 'talents',
    'talent_categories', 'talent_category_assignments', 'events',
    'event_categories', 'event_category_assignments', 'blog_authors',
    'blog_categories', 'blog_posts', 'blog_post_categories', 'media_assets',
    'media_collections', 'media_collection_items', 'donation_campaigns',
    'seo_metadata'
  ] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end $$;
