async function requestJson(path, options) {
  const response = await fetch(path, { credentials: "include", headers: options?.body ? { "Content-Type": "application/json" } : undefined, ...options });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Unable to complete the request.");
  return payload.data;
}

export const newsletterApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    return requestJson(`/api/admin/newsletter${qs ? `?${qs}` : ""}`);
  },
  update: (data) => requestJson("/api/admin/newsletter", { method: "PUT", body: JSON.stringify(data) }),
  exportCsv: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    return requestJson(`/api/admin/newsletter/export${query.toString() ? `?${query.toString()}` : ""}`);
  },
};
