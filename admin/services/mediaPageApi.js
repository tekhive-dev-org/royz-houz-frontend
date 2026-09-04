async function requestJson(path, options) {
  const response = await fetch(path, { credentials: "include", headers: options?.body ? { "Content-Type": "application/json" } : undefined, ...options });
  const payload = await response.json();
  if (!response.ok || !payload.success) throw new Error(payload.error?.message || "Unable to complete the request.");
  return payload.data;
}

export const mediaPageApi = {
  get: () => requestJson("/api/admin/media-page"),
  save: (data) => requestJson("/api/admin/media-page", { method: "PUT", body: JSON.stringify(data) }),
};
