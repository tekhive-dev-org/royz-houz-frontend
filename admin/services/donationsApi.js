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

export const donationsApi = {
  listCampaigns: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    return requestJson(`/api/admin/donations/campaigns${qs ? `?${qs}` : ""}`);
  },
  saveCampaign: (data, id) =>
    requestJson(`/api/admin/donations/campaigns`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  archiveCampaign: (id) => requestJson(`/api/admin/donations/campaigns?id=${id}`, { method: "DELETE" }),
  listRecords: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.campaignId) query.set("campaignId", params.campaignId);
    const qs = query.toString();
    return requestJson(`/api/admin/donations/records${qs ? `?${qs}` : ""}`);
  },
  updateNotes: (id, notes) =>
    requestJson(`/api/admin/donations/records`, { method: "PUT", body: JSON.stringify({ id, notes }) }),
  totals: (campaignId) =>
    requestJson(`/api/admin/donations/totals${campaignId ? `?campaignId=${campaignId}` : ""}`),
  getPageSettings: () => requestJson("/api/admin/donation-page"),
  updatePageSettings: (data) =>
    requestJson("/api/admin/donation-page", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  async exportCsv(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.campaignId) query.set("campaignId", params.campaignId);
    const qs = query.toString();
    const response = await fetch(`/api/admin/donations/export${qs ? `?${qs}` : ""}`, { credentials: "include" });
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.error?.message || "Unable to export records.");
    }
    return response.text();
  },
};
