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

export const mediaLibraryApi = {
  list: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.type) query.set("type", params.type);
    if (params.source) query.set("source", params.source);
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    return requestJson(`/api/admin/media-library${qs ? `?${qs}` : ""}`);
  },
  signedUpload: (data) =>
    requestJson(`/api/admin/media-library/signed-upload`, { method: "POST", body: JSON.stringify(data) }),
  registerUpload: (data) =>
    requestJson(`/api/admin/media-library`, { method: "POST", body: JSON.stringify(data) }),
  registerYouTube: (data) =>
    requestJson(`/api/admin/media-library/register-youtube`, { method: "POST", body: JSON.stringify(data) }),
  update: (data) => requestJson(`/api/admin/media-library`, { method: "PUT", body: JSON.stringify(data) }),
  archive: (id) => requestJson(`/api/admin/media-library?id=${id}`, { method: "DELETE" }),
  deleteAsset: (id) => requestJson(`/api/admin/media-library/${id}/delete`, { method: "DELETE" }),
  usage: (id) => requestJson(`/api/admin/media-library/${id}/usage`),
  collections: () => requestJson(`/api/admin/media-library/collections`),
  assignCollections: (data) =>
    requestJson(`/api/admin/media-library/collections`, { method: "POST", body: JSON.stringify(data) }),
};
