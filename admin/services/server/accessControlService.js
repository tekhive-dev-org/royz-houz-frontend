import { createHash, randomBytes } from "node:crypto";
import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { writeSuccessfulAdminMutationAudit } from "./adminAuthorizationService";
import { createPaginationMeta, normalizePagination } from "@/utils/pagination";

export function serviceSuccess(data, message = "Request completed") {
  return { success: true, data, message };
}

export function serviceFailure(code, message) {
  return { success: false, error: { code, message } };
}

function getClient(client) {
  return client || createAdminServiceRoleClient();
}

async function getRoleKeys(supabase, userId) {
  const { data } = await supabase
    .from("admin_role_assignments")
    .select("role_id, roles(role_key)")
    .eq("admin_user_id", userId)
    .is("revoked_at", null);
  return (data || []).map((row) => row.roles?.role_key).filter(Boolean);
}

async function countActiveSuperAdmins(supabase, excludeUserId) {
  const { data } = await supabase
    .from("admin_role_assignments")
    .select("admin_user_id, admin_profiles(status)")
    .eq("roles.role_key", "super_admin")
    .is("revoked_at", null)
    .eq("admin_profiles.status", "active");
  const unique = new Set((data || []).map((row) => row.admin_user_id));
  if (excludeUserId) unique.delete(excludeUserId);
  return unique.size;
}

async function requireRoleChangeAllowed(supabase, actorUserId, targetUserId, nextRoleIds) {
  // Never allow an administrator to alter their own assignments.
  if (targetUserId === actorUserId) {
    return serviceFailure("FORBIDDEN", "Administrators cannot change their own role assignments.");
  }

  const nextRoleKeys = nextRoleIds
    ? await supabase.from("roles").select("role_key").in("id", nextRoleIds).then(({ data }) => (data || []).map((row) => row.role_key))
    : await getRoleKeys(supabase, targetUserId);

  if (!nextRoleKeys.includes("super_admin")) {
    const remaining = await countActiveSuperAdmins(supabase, targetUserId);
    if (remaining <= 0) {
      return serviceFailure("CONFLICT", "The last active super administrator cannot be removed.");
    }
  }

  return null;
}

export async function listProfiles(client, { search, status, roleId } = {}) {
  const supabase = getClient(client);
  let query = supabase
    .from("admin_profiles")
    .select("user_id, display_name, status, updated_at, auth_users(email), admin_role_assignments(role_id, roles(role_key, name))")
    .is("admin_role_assignments.revoked_at", null)
    .order("display_name", { ascending: true });

  if (status) query = query.eq("status", status);
  if (search) query = query.or(`display_name.ilike.%${search}%,auth_users.email.ilike.%${search}%`);
  if (roleId) query = query.eq("admin_role_assignments.role_id", roleId);

  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load administrators.");

  return serviceSuccess(
    (data || []).map((row) => ({
      userId: row.user_id,
      displayName: row.display_name,
      email: row.auth_users?.email || null,
      status: row.status,
      roles: (row.admin_role_assignments || []).map((assignment) => ({ id: assignment.role_id, roleKey: assignment.roles?.role_key, name: assignment.roles?.name })),
    }))
  );
}

export async function updateProfileStatus(client, { actorUserId, userId, status }) {
  const supabase = getClient(client);
  if (userId === actorUserId) {
    return serviceFailure("FORBIDDEN", "Administrators cannot change their own account status.");
  }

  const { data: current } = await supabase.from("admin_profiles").select("user_id, status").eq("user_id", userId).maybeSingle();
  if (!current) return serviceFailure("NOT_FOUND", "Administrator profile was not found.");
  if (current.status === status) return serviceSuccess(current);

  if (status === "suspended") {
    const roleKeys = await getRoleKeys(supabase, userId);
    if (roleKeys.includes("super_admin")) {
      const remaining = await countActiveSuperAdmins(supabase, userId);
      if (remaining <= 0) {
        return serviceFailure("CONFLICT", "The last active super administrator cannot be suspended.");
      }
    }
  }

  const { data, error } = await supabase.from("admin_profiles").update({ status }).eq("user_id", userId).select().single();
  if (error) return serviceFailure("PERSIST_FAILED", "Unable to update the profile.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "admin_profiles.status_change", entityType: "admin_profiles", entityId: userId, oldValues: { status: current.status }, newValues: { status } },
    { client: supabase }
  );

  return serviceSuccess(data);
}

export async function listRoles(client) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("roles").select("*, role_permissions(permission_id, permissions(permission_key))").order("name", { ascending: true });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load roles.");
  return serviceSuccess(
    (data || []).map((row) => ({
      id: row.id,
      roleKey: row.role_key,
      name: row.name,
      description: row.description,
      isSystem: row.is_system,
      permissionIds: (row.role_permissions || []).map((relation) => relation.permission_id),
      permissions: (row.role_permissions || []).map((relation) => relation.permissions?.permission_key).filter(Boolean),
    }))
  );
}

export async function listPermissions(client) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("permissions").select("*").order("permission_key", { ascending: true });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load permissions.");
  return serviceSuccess(data || []);
}

export async function saveRole(client, { actorUserId, role }) {
  const supabase = getClient(client);
  const existing = role.id ? await supabase.from("roles").select("*").eq("id", role.id).maybeSingle() : { data: null };

  const roleResult = role.id
    ? await supabase.from("roles").update({ name: role.name, description: role.description || null }).eq("id", role.id).select().single()
    : await supabase.from("roles").insert({ role_key: role.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80), name: role.name, description: role.description || null, is_system: false }).select().single();

  if (roleResult.error) return serviceFailure("PERSIST_FAILED", "Unable to save the role.");
  const roleId = roleResult.data.id;

  await supabase.from("role_permissions").delete().eq("role_id", roleId);
  if (role.permissionIds.length) {
    const { error } = await supabase.from("role_permissions").insert(role.permissionIds.map((permissionId) => ({ role_id: roleId, permission_id: permissionId, created_by: actorUserId })));
    if (error) return serviceFailure("PERSIST_FAILED", "Unable to save role permissions.");
  }

  await writeSuccessfulAdminMutationAudit(
    {
      actorUserId,
      action: existing.data ? "roles.update" : "roles.create",
      entityType: "roles",
      entityId: roleId,
      oldValues: existing.data ? { name: existing.data.name } : null,
      newValues: { name: role.name, permissionIds: role.permissionIds },
    },
    { client: supabase }
  );

  return serviceSuccess(roleResult.data);
}

export async function updateRoleAssignments(client, { actorUserId, userId, roleIds }) {
  const supabase = getClient(client);
  const guard = await requireRoleChangeAllowed(supabase, actorUserId, userId, roleIds);
  if (guard) return guard;

  const current = await supabase
    .from("admin_role_assignments")
    .select("id, role_id")
    .eq("admin_user_id", userId)
    .is("revoked_at", null);

  const currentIds = (current.data || []).map((row) => row.role_id);
  const toAdd = roleIds.filter((id) => !currentIds.includes(id));
  const toRevoke = currentIds.filter((id) => !roleIds.includes(id));

  for (const assignmentId of (current.data || []).filter((row) => toRevoke.includes(row.role_id)).map((row) => row.id)) {
    await supabase.from("admin_role_assignments").update({ revoked_at: new Date().toISOString(), revoked_by: actorUserId }).eq("id", assignmentId);
  }

  for (const roleId of toAdd) {
    const { error } = await supabase.from("admin_role_assignments").insert({ admin_user_id: userId, role_id: roleId, assigned_by: actorUserId });
    if (error) return serviceFailure("PERSIST_FAILED", "Unable to assign the role.");
  }

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "admin_role_assignments.replace", entityType: "admin_role_assignments", entityId: userId, oldValues: { roleIds: currentIds }, newValues: { roleIds } },
    { client: supabase }
  );

  return serviceSuccess({ userId, roleIds });
}

export async function listInvitations(client) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("admin_invitations").select("*, roles(role_key, name)").order("created_at", { ascending: false });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load invitations.");
  return serviceSuccess(data || []);
}

export async function createInvitation(client, { actorUserId, email, roleId }) {
  const supabase = getClient(client);
  const token = randomBytes(24).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("admin_invitations")
    .insert({ email: email.toLowerCase(), role_id: roleId, invitation_token_hash: tokenHash, invited_by: actorUserId, expires_at: expiresAt })
    .select()
    .single();

  if (error) return serviceFailure("PERSIST_FAILED", "Unable to create the invitation.");

  // The raw token is returned once so the inviter can share it. Only the hash
  // is stored; never log the token or include it in audit metadata.
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "admin_invitations.create", entityType: "admin_invitations", entityId: data.id, newValues: { email: data.email, role_id: roleId } },
    { client: supabase }
  );

  return serviceSuccess({ id: data.id, email: data.email, role_id: roleId, expires_at: data.expires_at, invitationToken: token });
}

export async function revokeInvitation(client, { actorUserId, id }) {
  const supabase = getClient(client);
  const { data: existing } = await supabase.from("admin_invitations").select("id, status").eq("id", id).maybeSingle();
  if (!existing) return serviceFailure("NOT_FOUND", "Invitation was not found.");
  if (existing.status !== "pending") return serviceSuccess({ id, status: existing.status });

  const { data, error } = await supabase.from("admin_invitations").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) return serviceFailure("PERSIST_FAILED", "Unable to revoke the invitation.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "admin_invitations.revoke", entityType: "admin_invitations", entityId: id, oldValues: { status: existing.status }, newValues: { status: "revoked" } },
    { client: supabase }
  );

  return serviceSuccess(data);
}

export async function listAuditLogs(client, { page, limit, action, actor, entityType, from, to } = {}) {
  const supabase = getClient(client);
  const pagination = normalizePagination({ page, limit });
  let query = supabase.from("audit_logs").select("*", { count: "exact" });

  if (action) query = query.eq("action", action);
  if (actor) query = query.eq("actor_user_id", actor);
  if (entityType) query = query.eq("entity_type", entityType);
  if (from) query = query.gte("created_at", from);
  if (to) query = query.lte("created_at", to);

  query = query.order("created_at", { ascending: false }).range(pagination.from, pagination.to);

  const { data, error, count } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load audit logs.");

  return serviceSuccess(
    (data || []).map((row) => ({
      id: row.id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      actorUserId: row.actor_user_id,
      createdAt: row.created_at,
      // Audit payloads are already redacted at write time; expose structured
      // fields only, never raw metadata blobs that could contain secrets.
    })),
    "Audit logs loaded.",
    createPaginationMeta({ page: pagination.page, limit: pagination.limit, total: count || 0 })
  );
}
