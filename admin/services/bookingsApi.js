async function request(path, options) {
  const response = await fetch(path, { credentials: "include", headers: options?.body ? { "Content-Type": "application/json" } : undefined, ...options });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) throw new Error(payload?.error?.message || "Unable to complete the request.");
  return payload;
}
export const bookingsApi = {
  async list(params = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined).map(([key, value]) => [key, String(value)]));
    const payload = await request(`/api/admin/bookings?${query}`);
    return { items: payload.data, pagination: payload.meta?.pagination || null };
  },
  async get(id) { return (await request(`/api/admin/bookings/${id}`)).data; },
  async assignees() { return (await request("/api/admin/bookings/assignees")).data; },
  async update(data) { return (await request("/api/admin/bookings", { method: "PUT", body: JSON.stringify(data) })).data; },
};
