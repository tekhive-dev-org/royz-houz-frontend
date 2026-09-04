import { createAdminServerClient, createAdminTokenClient } from "@/lib/supabase/server";
import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { ApiErrorCode, sendError } from "@/utils/apiResponse";

const permissionPattern = /^[a-z][a-z0-9_]{1,79}\.[a-z][a-z0-9_]{1,79}$/;

function getBearerToken(req) {
  const header = req.headers?.authorization;
  if (typeof header !== "string") return null;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

async function getAuthenticatedUser(req, res) {
  const bearerToken = getBearerToken(req);
  const supabase = bearerToken ? createAdminTokenClient() : createAdminServerClient(req, res);
  const { data, error } = bearerToken ? await supabase.auth.getUser(bearerToken) : await supabase.auth.getUser();

  if (error || !data.user) return null;
  return data.user;
}

/**
 * Loads server-authoritative access data. A Supabase account alone is never
 * sufficient: it must have an active profile and at least one active role.
 */
export async function getAdminAccess(userId, { client } = {}) {
  const supabase = client || createAdminServiceRoleClient();
  const now = new Date().toISOString();
  const [{ data: profile, error: profileError }, { data: assignments, error: assignmentError }] = await Promise.all([
    supabase.from("admin_profiles").select("user_id, display_name, status").eq("user_id", userId).maybeSingle(),
    supabase
      .from("admin_role_assignments")
      .select("role_id, expires_at, roles(role_key, name)")
      .eq("admin_user_id", userId)
      .is("revoked_at", null)
      .or(`expires_at.is.null,expires_at.gt.${now}`),
  ]);

  if (profileError || assignmentError || !profile || profile.status !== "active" || !assignments?.length) {
    return null;
  }

  return {
    userId: profile.user_id,
    displayName: profile.display_name,
    roles: assignments.map((assignment) => assignment.roles?.role_key).filter(Boolean),
  };
}

export async function getAuthenticatedAdmin(req, res, { client } = {}) {
  const user = await getAuthenticatedUser(req, res);
  if (!user) return { status: "unauthenticated", user: null, admin: null };

  const admin = await getAdminAccess(user.id, { client });
  if (!admin) return { status: "unauthorized", user, admin: null };
  return { status: "authorized", user, admin };
}

function sendAuthorizationFailure(res, status, requestId) {
  if (status === "unauthenticated") {
    return sendError(res, ApiErrorCode.SESSION_EXPIRED, "Your session has expired. Please sign in again.", {
      status: 401,
      requestId,
    });
  }
  return sendError(res, ApiErrorCode.ADMIN_ACCESS_REQUIRED, "You are not authorized to access this resource.", {
    status: 403,
    requestId,
  });
}

/**
 * Required server helper for every protected admin API operation. It validates
 * the session server-side, verifies active admin access, and asks the database
 * for the exact permission; request body roles are never considered.
 */
/** Returns every permission key the user currently holds through active role assignments. */
export async function getAdminPermissionKeys(userId, { client } = {}) {
  const supabase = client || createAdminServiceRoleClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("admin_role_assignments")
    .select("role_id, expires_at, role_permissions(permissions(permission_key))")
    .eq("admin_user_id", userId)
    .is("revoked_at", null)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (error || !data) return [];

  const keys = new Set();
  for (const assignment of data) {
    for (const relation of assignment.role_permissions || []) {
      if (relation.permissions?.permission_key) keys.add(relation.permissions.permission_key);
    }
  }
  return [...keys];
}

/** Exact permission check for an already-authenticated admin. Returns boolean only. */
export async function adminHasExactPermission(userId, permissionKey, { client } = {}) {
  if (!permissionPattern.test(permissionKey || "") || !userId) return false;

  const supabase = client || createAdminServiceRoleClient();
  const { data: permitted, error } = await supabase.rpc("has_admin_permission_for_user", {
    p_user_id: userId,
    p_permission_key: permissionKey,
  });

  return !error && Boolean(permitted);
}

export async function requireAdminPermission(req, res, permissionKey, { client, requestId } = {}) {
  if (!permissionPattern.test(permissionKey || "")) {
    throw new Error("requireAdminPermission received an invalid permission key.");
  }

  const result = await getAuthenticatedAdmin(req, res, { client });
  if (result.status !== "authorized") {
    sendAuthorizationFailure(res, result.status, requestId);
    return null;
  }

  const permitted = await adminHasExactPermission(result.user.id, permissionKey, { client });
  if (!permitted) {
    sendError(res, ApiErrorCode.PERMISSION_DENIED, "You do not have permission to perform this operation.", {
      status: 403,
      requestId,
    });
    return null;
  }

  return { user: result.user, admin: result.admin, permission: permissionKey };
}

/** Call only after a protected mutation has completed successfully. */
export async function writeSuccessfulAdminMutationAudit(
  { actorUserId, action, entityType, entityId = null, oldValues = null, newValues = null, metadata = {} },
  { client } = {}
) {
  const supabase = client || createAdminServiceRoleClient();
  const { error } = await supabase.rpc("write_audit_log", {
    p_actor_user_id: actorUserId,
    p_action: action,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_old_values: oldValues,
    p_new_values: newValues,
    p_metadata: metadata,
  });

  if (error) throw new Error("Unable to record the administrative audit event.");
}
