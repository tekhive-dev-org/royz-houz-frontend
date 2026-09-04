async function requestJson(path, options) {
  const response = await fetch(path, {
    credentials: "include",
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    ...options,
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || "Unable to complete the request.");
  }
  return payload.data;
}

export const submissionsApi = {
  async list(module, params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    const response = await fetch(`/api/admin/${module}${qs ? `?${qs}` : ""}`, { credentials: "include" });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message || "Unable to load submissions.");
    }
    return { items: payload.data, pagination: payload.meta?.pagination || null };
  },
  get: (module, id) => requestJson(`/api/admin/${module}/${id}`),
  update: (module, data) => requestJson(`/api/admin/${module}`, { method: "PUT", body: JSON.stringify(data) }),
  listAdminUsers: () => requestJson(`/api/admin/submissions/admin-users`),
  async exportCsv(module, params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    const response = await fetch(`/api/admin/${module}/export${qs ? `?${qs}` : ""}`, { credentials: "include" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error?.message || "Unable to export.");
    }
    return response.text();
  },
};
