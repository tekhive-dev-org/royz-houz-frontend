async function requestJson(path, options) {
  const response = await fetch(path, {
    credentials: "include",
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
    ...options,
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "Unable to complete the request.");
  }
  return payload;
}

export const contentReportsApi = {
  async list(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.reason) query.set("reason", params.reason);
    const suffix = query.toString();
    const payload = await requestJson(`/api/admin/reports${suffix ? `?${suffix}` : ""}`);
    return { items: payload.data, pagination: payload.meta?.pagination || null };
  },
  async get(id) {
    return (await requestJson(`/api/admin/reports/${id}`)).data;
  },
  async assignees() {
    return (await requestJson("/api/admin/reports/assignees")).data;
  },
  async update(input) {
    return (
      await requestJson("/api/admin/reports", {
        method: "PUT",
        body: JSON.stringify(input),
      })
    ).data;
  },
};
