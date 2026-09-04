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

export const siteApi = {
  listSettings: () => requestJson("/api/admin/site/settings"),
  saveSetting: (data, id) =>
    requestJson(`/api/admin/site/settings`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),

  listNavigation: () => requestJson("/api/admin/site/navigation"),
  saveNavigation: (data, id) =>
    requestJson(`/api/admin/site/navigation`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  reorderNavigation: (ids) =>
    requestJson(`/api/admin/site/navigation`, { method: "PATCH", body: JSON.stringify({ ids }) }),
  deleteNavigation: (id) => requestJson(`/api/admin/site/navigation?id=${id}`, { method: "DELETE" }),

  listFooterSections: () => requestJson("/api/admin/site/footer-sections"),
  saveFooterSection: (data, id) =>
    requestJson(`/api/admin/site/footer-sections`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  reorderFooterSections: (ids) =>
    requestJson(`/api/admin/site/footer-sections`, { method: "PATCH", body: JSON.stringify({ ids }) }),
  deleteFooterSection: (id) => requestJson(`/api/admin/site/footer-sections?id=${id}`, { method: "DELETE" }),

  listFooterLinks: (sectionId) =>
    requestJson(`/api/admin/site/footer-links${sectionId ? `?sectionId=${sectionId}` : ""}`),
  saveFooterLink: (data, id) =>
    requestJson(`/api/admin/site/footer-links`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  reorderFooterLinks: (ids) =>
    requestJson(`/api/admin/site/footer-links`, { method: "PATCH", body: JSON.stringify({ ids }) }),
  deleteFooterLink: (id) => requestJson(`/api/admin/site/footer-links?id=${id}`, { method: "DELETE" }),

  listSocialLinks: (placement) =>
    requestJson(`/api/admin/site/social-links${placement ? `?placement=${placement}` : ""}`),
  saveSocialLink: (data, id) =>
    requestJson(`/api/admin/site/social-links`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  reorderSocialLinks: (ids) =>
    requestJson(`/api/admin/site/social-links`, { method: "PATCH", body: JSON.stringify({ ids }) }),
  deleteSocialLink: (id) => requestJson(`/api/admin/site/social-links?id=${id}`, { method: "DELETE" }),

  getSeo: () => requestJson("/api/admin/site/seo"),
  saveSeo: (data, id) =>
    requestJson(`/api/admin/site/seo`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),

  getContactInfo: () => requestJson("/api/admin/site/contact-info"),
  saveContactInfo: (data) =>
    requestJson(`/api/admin/site/contact-info`, { method: "PUT", body: JSON.stringify(data) }),

  getAnnouncement: () => requestJson("/api/admin/site/announcement"),
  saveAnnouncement: (data) =>
    requestJson(`/api/admin/site/announcement`, { method: "PUT", body: JSON.stringify(data) }),
};
