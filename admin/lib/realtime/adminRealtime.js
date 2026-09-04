import { getAdminBrowserClient } from "@/lib/supabase/browser";

export const ADMIN_REALTIME_TABLES = [
  "site_settings",
  "navigation_items",
  "footer_sections",
  "footer_links",
  "social_links",
  "homepage_sections",
  "about_sections",
  "talents",
  "talent_categories",
  "talent_category_assignments",
  "events",
  "event_categories",
  "event_category_assignments",
  "blog_authors",
  "blog_categories",
  "blog_posts",
  "blog_post_categories",
  "blog_comments",
  "media_assets",
  "media_collections",
  "media_collection_items",
  "media_asset_references",
  "donation_campaigns",
  "donation_records",
  "contact_submissions",
  "newsletter_subscriptions",
  "join_applications",
  "content_reports",
  "booking_requests",
  "admin_profiles",
  "admin_role_assignments",
  "admin_invitations",
  "audit_logs",
  "content_revisions",
  "publishing_activity",
];

export function subscribeToAdminChanges(onChange) {
  const client = getAdminBrowserClient();
  const channel = client.channel("admin-content-changes");

  ADMIN_REALTIME_TABLES.forEach((table) => {
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table },
      (payload) => onChange({ ...payload, table })
    );
  });

  channel.subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}
