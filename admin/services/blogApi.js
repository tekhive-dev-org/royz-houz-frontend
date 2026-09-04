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

export const blogApi = {
  listPosts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.category) query.set("category", params.category);
    if (params.featured !== undefined) query.set("featured", String(params.featured));
    const qs = query.toString();
    return requestJson(`/api/admin/blog/posts${qs ? `?${qs}` : ""}`);
  },
  savePost: (data, id) =>
    requestJson(`/api/admin/blog/posts`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  archivePost: (id) => requestJson(`/api/admin/blog/posts?id=${id}`, { method: "DELETE" }),
  previewPost: (id) => requestJson(`/api/admin/blog/posts/${id}/preview`),
  revisions: (id) => requestJson(`/api/admin/blog/posts/${id}/revisions`),
  reorderFeatured: (ids) =>
    requestJson(`/api/admin/blog/posts`, {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    }),

  // Categories
  listCategories: () => requestJson(`/api/admin/blog-categories`),
  saveCategory: (data, id) =>
    requestJson(`/api/admin/blog-categories`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  deleteCategory: (id) => requestJson(`/api/admin/blog-categories?id=${id}`, { method: "DELETE" }),
  reorderCategories: (ids) =>
    requestJson(`/api/admin/blog-categories`, {
      method: "PATCH",
      body: JSON.stringify({ ids }),
    }),

  // Authors
  listAuthors: () => requestJson(`/api/admin/blog-authors`),
  saveAuthor: (data, id) =>
    requestJson(`/api/admin/blog-authors`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  deleteAuthor: (id) => requestJson(`/api/admin/blog-authors?id=${id}`, { method: "DELETE" }),

  // Page-level content & settings
  getPageSettings: () => requestJson(`/api/admin/blog-page`),
  savePageSettings: (data) =>
    requestJson(`/api/admin/blog-page`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Comments
  listComments: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return requestJson(`/api/admin/blog/comments${qs ? `?${qs}` : ""}`);
  },
  moderateComment: (data) =>
    requestJson(`/api/admin/blog/comments`, { method: "POST", body: JSON.stringify(data) }),
  deleteComment: (id) => requestJson(`/api/admin/blog/comments?id=${id}`, { method: "DELETE" }),

  listMedia: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    const qs = query.toString();
    return requestJson(`/api/admin/media${qs ? `?${qs}` : ""}`);
  },
};
