import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export const PUBLIC_REALTIME_TABLES = [
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
  "media_assets",
  "media_collections",
  "media_collection_items",
  "donation_campaigns",
  "seo_metadata",
];

export function subscribeToPublicContentChanges(onChange) {
  const client = getSupabaseBrowserClient();
  const channel = client.channel("public-content-changes");

  PUBLIC_REALTIME_TABLES.forEach((table) => {
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
