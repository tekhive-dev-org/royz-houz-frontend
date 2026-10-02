/**
 * Returns the canonical public website URL for a given path.
 * Strips localhost or dev port defaults in production.
 */
export function getPublicSiteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_WEB_URL || "https://royzhouz.com";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  if (!path || path === "/") return cleanBase;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
