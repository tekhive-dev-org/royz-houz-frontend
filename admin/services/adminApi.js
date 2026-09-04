/**
 * Minimal client API wrapper reserved for future admin modules.
 * The foundation endpoint is read-only and has no Supabase dependency.
 */
export async function getAdminFoundationStatus() {
  const response = await fetch("/api/admin/health");

  if (!response.ok) {
    throw new Error("Unable to load the admin foundation status.");
  }

  return response.json();
}
