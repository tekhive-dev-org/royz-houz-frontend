import { createClient } from "@supabase/supabase-js";

// Build-safe: falls back to a default site URL so static builds never throw on
// a missing environment variable, while production can override it.
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://royzhouz.com").replace(/\/$/, "");

function createSitemapClient() {
  if (typeof window !== "undefined") throw new Error("Sitemap may only run on the server.");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function urlElement(loc, lastmod) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(`${SITE_URL}${loc}`)}</loc>`,
    lastmod ? `    <lastmod>${xmlEscape(lastmod.slice(0, 10))}</lastmod>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Public XML sitemap. Only published records are included; drafts, scheduled,
 * and archived content are excluded. Merchandise demo routes are intentionally
 * not added so their current SEO behaviour is unchanged.
 */
export default async function handler(_req, res) {
  const supabase = createSitemapClient();
  if (!supabase) {
    // Build/preview fallback: static routes only, never includes non-public content.
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlElement("/")}\n</urlset>`);
  }

  const [talents, events, blogPosts, mediaCollections, campaigns] = await Promise.all([
    supabase.from("published_talents").select("slug, updated_at"),
    supabase.from("published_events").select("slug, updated_at"),
    supabase.from("published_blog_posts").select("slug, updated_at"),
    supabase.from("published_media").select("slug, updated_at"),
    supabase.from("donation_campaigns").select("slug, updated_at").eq("status", "published").lte("published_at", new Date().toISOString()),
  ]);

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlElement("/", new Date().toISOString()),
    urlElement("/about"),
    urlElement("/talents"),
    urlElement("/events"),
    urlElement("/blog"),
    urlElement("/media"),
    urlElement("/contact"),
    urlElement("/join"),
    urlElement("/donate"),
  ];

  for (const row of talents.data || []) lines.push(urlElement(`/talents/${row.slug}`, row.updated_at));
  for (const row of events.data || []) lines.push(urlElement(`/events/${row.slug}`, row.updated_at));
  for (const row of blogPosts.data || []) lines.push(urlElement(`/blog/${row.slug}`, row.updated_at));
  for (const row of mediaCollections.data || []) lines.push(urlElement(`/media/${row.slug}`, row.updated_at));
  for (const row of campaigns.data || []) lines.push(urlElement(`/donate/${row.slug}`, row.updated_at));

  lines.push("</urlset>");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.status(200).send(lines.join("\n"));
}

// Force dynamic server rendering so the API-style handler receives a real response object.
export async function getServerSideProps() {
  return { props: {} };
}
