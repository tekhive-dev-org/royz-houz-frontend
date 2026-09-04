-- Admin Realtime subscriptions are permission-scoped and read-only. The admin
-- app still refetches through protected API routes after each change signal.

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
  to authenticated;

create policy admin_read_website_realtime
  on public.site_settings for select to authenticated
  using (public.has_admin_permission('settings.read'));
create policy admin_read_navigation_realtime
  on public.navigation_items for select to authenticated
  using (public.has_admin_permission('settings.read'));
create policy admin_read_footer_realtime
  on public.footer_sections for select to authenticated
  using (public.has_admin_permission('settings.read'));
create policy admin_read_footer_links_realtime
  on public.footer_links for select to authenticated
  using (public.has_admin_permission('settings.read'));
create policy admin_read_social_realtime
  on public.social_links for select to authenticated
  using (public.has_admin_permission('settings.read'));
create policy admin_read_homepage_realtime
  on public.homepage_sections for select to authenticated
  using (public.has_admin_permission('homepage.read'));
create policy admin_read_about_realtime
  on public.about_sections for select to authenticated
  using (public.has_admin_permission('homepage.read'));
create policy admin_read_talents_realtime
  on public.talents for select to authenticated
  using (public.has_admin_permission('talents.create'));
create policy admin_read_talent_categories_realtime
  on public.talent_categories for select to authenticated
  using (public.has_admin_permission('talents.create'));
create policy admin_read_talent_assignments_realtime
  on public.talent_category_assignments for select to authenticated
  using (public.has_admin_permission('talents.create'));
create policy admin_read_events_realtime
  on public.events for select to authenticated
  using (public.has_admin_permission('events.create'));
create policy admin_read_event_categories_realtime
  on public.event_categories for select to authenticated
  using (public.has_admin_permission('events.create'));
create policy admin_read_event_assignments_realtime
  on public.event_category_assignments for select to authenticated
  using (public.has_admin_permission('events.create'));
create policy admin_read_blog_realtime
  on public.blog_posts for select to authenticated
  using (public.has_admin_permission('blog.create'));
create policy admin_read_blog_authors_realtime
  on public.blog_authors for select to authenticated
  using (public.has_admin_permission('blog.create'));
create policy admin_read_blog_categories_realtime
  on public.blog_categories for select to authenticated
  using (public.has_admin_permission('blog.create'));
create policy admin_read_blog_assignments_realtime
  on public.blog_post_categories for select to authenticated
  using (public.has_admin_permission('blog.create'));
create policy admin_read_media_realtime
  on public.media_assets for select to authenticated
  using (public.has_admin_permission('media.upload'));
create policy admin_read_media_collections_realtime
  on public.media_collections for select to authenticated
  using (public.has_admin_permission('media.upload'));
create policy admin_read_media_items_realtime
  on public.media_collection_items for select to authenticated
  using (public.has_admin_permission('media.upload'));
create policy admin_read_donation_campaigns_realtime
  on public.donation_campaigns for select to authenticated
  using (public.has_admin_permission('donations.read'));
create policy admin_read_seo_realtime
  on public.seo_metadata for select to authenticated
  using (public.has_admin_permission('settings.read'));

grant select on table
  public.blog_comments,
  public.donation_records,
  public.contact_submissions,
  public.join_applications,
  public.content_reports,
  public.booking_requests,
  public.media_asset_references
  to authenticated;

create policy admin_read_blog_comments_realtime
  on public.blog_comments for select to authenticated
  using (public.has_admin_permission('comments.moderate'));
create policy admin_read_donation_records_realtime
  on public.donation_records for select to authenticated
  using (public.has_admin_permission('donations.read'));
create policy admin_read_contact_submissions_realtime
  on public.contact_submissions for select to authenticated
  using (public.has_admin_permission('contacts.read'));
create policy admin_read_join_applications_realtime
  on public.join_applications for select to authenticated
  using (public.has_admin_permission('applications.read'));
create policy admin_read_content_reports_realtime
  on public.content_reports for select to authenticated
  using (public.has_admin_permission('reports.read'));
create policy admin_read_booking_requests_realtime
  on public.booking_requests for select to authenticated
  using (public.has_admin_permission('bookings.read'));
create policy admin_read_media_references_realtime
  on public.media_asset_references for select to authenticated
  using (public.has_admin_permission('media.upload'));

grant select on table
  public.roles,
  public.permissions,
  public.role_permissions,
  public.admin_role_assignments,
  public.admin_invitations
  to authenticated;

create policy admin_read_roles_realtime
  on public.roles for select to authenticated
  using (public.has_admin_permission('users.manage'));
create policy admin_read_permissions_realtime
  on public.permissions for select to authenticated
  using (public.has_admin_permission('users.manage'));
create policy admin_read_role_permissions_realtime
  on public.role_permissions for select to authenticated
  using (public.has_admin_permission('users.manage'));
create policy admin_read_role_assignments_realtime
  on public.admin_role_assignments for select to authenticated
  using (public.has_admin_permission('users.manage'));
create policy admin_read_invitations_realtime
  on public.admin_invitations for select to authenticated
  using (public.has_admin_permission('users.manage'));

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
    'seo_metadata', 'blog_comments', 'donation_records',
    'contact_submissions', 'join_applications', 'content_reports',
    'booking_requests', 'media_asset_references', 'admin_profiles',
    'admin_role_assignments', 'admin_invitations', 'audit_logs',
    'content_revisions', 'publishing_activity'
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
