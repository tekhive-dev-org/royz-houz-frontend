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

export const testimonialsAdminApi = {
  getTestimonials: () => requestJson("/api/admin/testimonials"),
  saveItem: (item) =>
    requestJson("/api/admin/testimonials", {
      method: item.id ? "PUT" : "POST",
      body: JSON.stringify({ item }),
    }),
  saveHeader: ({ badge, title, description }) =>
    requestJson("/api/admin/testimonials", {
      method: "PUT",
      body: JSON.stringify({ badge, title, description }),
    }),
  reorderItems: (ids) =>
    requestJson("/api/admin/testimonials", {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    }),
  deleteItem: (id) =>
    requestJson(`/api/admin/testimonials?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
};
