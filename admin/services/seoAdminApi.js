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

export const seoAdminApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    if (params.search) query.set("search", params.search);
    const qs = query.toString();
    return requestJson(`/api/admin/seo${qs ? `?${qs}` : ""}`);
  },
  getDefault: () => requestJson(`/api/admin/seo?type=default`),
  saveDefault: (data) => requestJson(`/api/admin/seo`, { method: "PUT", body: JSON.stringify(data) }),
  getRecord: (type, id) => requestJson(`/api/admin/seo/records?type=${type}&id=${id}`),
  saveRecord: (type, id, data) =>
    requestJson(`/api/admin/seo/records?type=${type}&id=${id}`, { method: "PUT", body: JSON.stringify(data) }),
  preview: (data) => requestJson(`/api/admin/seo/preview`, { method: "POST", body: JSON.stringify(data) }),
};
