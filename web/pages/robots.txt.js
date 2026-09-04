const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://royzhouz.com").replace(/\/$/, "");

/** Public robots.txt. Merchandise demo routes keep their current behaviour. */
export default async function handler(_req, res) {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ];

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
  return res.status(200).send(lines.join("\n"));
}

// Force dynamic server rendering so the API-style handler receives a real response object.
export async function getServerSideProps() {
  return { props: {} };
}
