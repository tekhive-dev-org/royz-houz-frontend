/** Returns only safe, same-origin relative application paths. */
export function getSafeRedirectPath(value, fallback = "/") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "http://admin.local");
    return parsed.origin === "http://admin.local" ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
}
