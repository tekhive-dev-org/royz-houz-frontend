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

export const accessControlApi = {
  listProfiles: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    return requestJson(`/api/admin/access-control/profiles${qs ? `?${qs}` : ""}`);
  },
  updateProfile: (data) => requestJson(`/api/admin/access-control/profiles`, { method: "PUT", body: JSON.stringify(data) }),
  listRoles: () => requestJson(`/api/admin/access-control/roles`),
  listPermissions: () => requestJson(`/api/admin/access-control/roles?include=permissions`),
  saveRole: (data, id) =>
    requestJson(`/api/admin/access-control/roles`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(id ? { ...data, id } : data),
    }),
  listInvitations: () => requestJson(`/api/admin/access-control/invitations`),
  createInvitation: (data) => requestJson(`/api/admin/access-control/invitations`, { method: "POST", body: JSON.stringify(data) }),
  revokeInvitation: (id) => requestJson(`/api/admin/access-control/invitations?id=${id}`, { method: "DELETE", body: JSON.stringify({ confirm: true }) }),
  async listAuditLogs(params = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.action) query.set("action", params.action);
    if (params.actor) query.set("actor", params.actor);
    if (params.entityType) query.set("entityType", params.entityType);
    if (params.from) query.set("from", params.from);
    if (params.to) query.set("to", params.to);
    const qs = query.toString();
    const response = await fetch(`/api/admin/access-control/audit-logs${qs ? `?${qs}` : ""}`, { credentials: "include" });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      throw new Error(payload.error?.message || "Unable to load audit logs.");
    }
    return { items: payload.data, pagination: payload.meta?.pagination || null };
  },
};
