/**
 * Returns the canonical public website URL for a given path.
 * Defaults to the production domain https://royzhouz.com.
 */
export function getPublicSiteUrl(path = "") {
  const base = process.env.NEXT_PUBLIC_WEB_URL || "https://royzhouz.com";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  if (!path || path === "/") return cleanBase;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

/**
 * Returns the canonical admin portal URL for a given path.
 * Defaults to the production domain https://admin.royzhouz.com.
 */
export function getAdminSiteUrl(path = "") {
  const base =
    process.env.NEXT_PUBLIC_ADMIN_URL ||
    process.env.NEXT_PUBLIC_ADMIN_APP_URL ||
    "https://admin.royzhouz.com";
  const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
  if (!path || path === "/") return cleanBase;
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}
