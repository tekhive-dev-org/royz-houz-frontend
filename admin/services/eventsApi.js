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

export const eventsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.category) query.set("category", params.category);
    if (params.status) query.set("status", params.status);
    if (params.featured !== undefined) query.set("featured", String(params.featured));
    const qs = query.toString();
    return requestJson(`/api/admin/events${qs ? `?${qs}` : ""}`);
  },
  save: (data, id) =>
    requestJson(`/api/admin/events`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  reorderFeatured: (ids) =>
    requestJson(`/api/admin/events`, { method: "PATCH", body: JSON.stringify({ ids }) }),
  archive: (id) => requestJson(`/api/admin/events?id=${id}`, { method: "DELETE" }),
  preview: (id) => requestJson(`/api/admin/events/${id}/preview`),
  listCategories: () => requestJson(`/api/admin/event-categories`),
  saveCategory: (data, id) =>
    requestJson(`/api/admin/event-categories`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  reorderCategories: (ids) =>
    requestJson(`/api/admin/event-categories`, { method: "PATCH", body: JSON.stringify({ ids }) }),
  deleteCategory: (id) => requestJson(`/api/admin/event-categories?id=${id}`, { method: "DELETE" }),
  listMedia: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return requestJson(`/api/admin/media${qs ? `?${qs}` : ""}`);
  },
};
