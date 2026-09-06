async function request(path) {
  const response = await fetch(path, { credentials: "include" });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.error?.message || "Unable to load payments.");
  return body;
}

export const paymentsApi = {
  async list(params = {}) {
    const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value));
    const body = await request(`/api/admin/payments?${query}`);
    return { items: body.data || [], pagination: body.meta?.pagination || null };
  },
  get: async (id) => (await request(`/api/admin/payments/${id}`)).data,
  exportCsv: async (status) => {
    const response = await fetch(`/api/admin/payments/export${status ? `?status=${encodeURIComponent(status)}` : ""}`, { credentials: "include" });
    if (!response.ok) throw new Error("Unable to export payments.");
    return response.text();
  },
};
