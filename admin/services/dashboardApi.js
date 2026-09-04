export async function fetchDashboardSummary({ days } = {}) {
  const params = new URLSearchParams();
  if (days) params.set("days", String(days));

  const query = params.toString();
  const response = await fetch(`/api/admin/dashboard${query ? `?${query}` : ""}`);

  if (!response.ok) {
    throw new Error("Unable to load the admin dashboard.");
  }

  const payload = await response.json();
  if (!payload.success) throw new Error(payload.error?.message || "Unable to load the admin dashboard.");
  return payload.data;
}
