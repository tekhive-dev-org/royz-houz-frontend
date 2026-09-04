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

export const contentApi = {
  listSections: (type, includePreview = false) =>
    requestJson(`/api/admin/content/${type}${includePreview ? "?includePreview=true" : ""}`),
  saveSection: (type, data, id) =>
    requestJson(`/api/admin/content/${type}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  reorderSections: (type, ids) =>
    requestJson(`/api/admin/content/${type}`, { method: "PATCH", body: JSON.stringify({ ids }) }),
  deleteSection: (type, id) => requestJson(`/api/admin/content/${type}?id=${id}`, { method: "DELETE" }),
  listMedia: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return requestJson(`/api/admin/media${qs ? `?${qs}` : ""}`);
  },
};
