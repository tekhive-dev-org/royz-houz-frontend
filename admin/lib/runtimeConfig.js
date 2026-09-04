/**
 * Returns public runtime settings used by the disconnected admin foundation.
 * Supabase and Cloudinary configuration is intentionally not read here yet.
 */
export function getAdminRuntimeConfig() {
  return {
    appUrl: process.env.NEXT_PUBLIC_ADMIN_APP_URL || "http://localhost:3001",
  };
}
