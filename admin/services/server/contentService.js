import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { writeSuccessfulAdminMutationAudit } from "./adminAuthorizationService";

export function serviceSuccess(data, message = "Request completed successfully") {
  return { success: true, data, message };
}

export function serviceFailure(code, message) {
  return { success: false, error: { code, message } };
}

function getClient(client) {
  return client || createAdminServiceRoleClient();
}

export async function listRows(client, table, { select = "*", order = { column: "sort_order" }, filters = [], limit = 200 } = {}) {
  const supabase = getClient(client);
  let query = supabase.from(table).select(select);
  for (const filter of filters) query = query.eq(filter.column, filter.value);
  if (order) query = query.order(order.column, { ascending: order.ascending ?? true });
  query = query.limit(limit);

  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load records.");
  return serviceSuccess(data || []);
}

export async function getRow(client, table, id, { select = "*" } = {}) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from(table).select(select).eq("id", id).maybeSingle();
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load the record.");
  if (!data) return serviceFailure("NOT_FOUND", "Record was not found.");
  return serviceSuccess(data);
}

function buildStatusPayload(status, scheduledAt) {
  const now = new Date().toISOString();
  if (status === "published") return { status, published_at: now, scheduled_at: null };
  if (status === "scheduled") return { status, scheduled_at: scheduledAt || null };
  if (status === "archived") return { status };
  return { status: "draft", published_at: null, scheduled_at: null };
}

/**
 * Upserts an admin-managed content row by optional id (insert when absent) and
 * applies the requested lifecycle state. Audit is written only on success.
 */
export async function upsertContentRow(
  client,
  { table, actorUserId, row = {}, status = "draft", scheduledAt = null, auditAction = `${table}.update`, idColumn = "id" }
) {
  const supabase = getClient(client);
  const payload = { ...row, ...buildStatusPayload(status, scheduledAt) };
  const hasId = Boolean(row[idColumn]);

  const result = hasId
    ? await supabase.from(table).update(payload).eq(idColumn, row[idColumn]).select().single()
    : await supabase.from(table).insert(payload).select().single();

  if (result.error) return serviceFailure("PERSIST_FAILED", "Unable to save the record.");

  try {
    await writeSuccessfulAdminMutationAudit(
      {
        actorUserId,
        action: auditAction,
        entityType: table,
        entityId: result.data.id,
        newValues: { status },
      },
      { client: supabase }
    );
  } catch {
    // The mutation already succeeded; do not fail the request over audit issues.
  }

  return serviceSuccess(result.data);
}

/**
 * Reorders rows to the exact order of the provided IDs. Uses explicit sort
 * controls rather than drag-and-drop so the admin UI remains accessible.
 */
export async function reorderRows(client, { table, ids, actorUserId, auditAction = `${table}.reorder` }) {
  const supabase = getClient(client);
  if (!ids || ids.length === 0) return serviceSuccess({ ordered: [] });

  // Phase 1: Shift to safe temporary high offset (10000+) to avoid unique constraint collisions
  // such as navigation_items_placement_sort_unique
  const tempOffset = 10000;
  const tempUpdates = ids.map((id, index) =>
    supabase.from(table).update({ sort_order: tempOffset + index }).eq("id", id)
  );
  const tempResults = await Promise.all(tempUpdates);
  const tempFailed = tempResults.find((result) => result.error);
  if (tempFailed) return serviceFailure("REORDER_FAILED", tempFailed.error?.message || "Unable to reorder records.");

  // Phase 2: Set final zero-indexed target sort_order
  const finalUpdates = ids.map((id, index) =>
    supabase.from(table).update({ sort_order: index }).eq("id", id)
  );
  const finalResults = await Promise.all(finalUpdates);
  const finalFailed = finalResults.find((result) => result.error);
  if (finalFailed) return serviceFailure("REORDER_FAILED", finalFailed.error?.message || "Unable to reorder records.");

  try {
    await writeSuccessfulAdminMutationAudit(
      { actorUserId, action: auditAction, entityType: table, newValues: { order: ids } },
      { client: supabase }
    );
  } catch {
    // Mutation already succeeded.
  }

  return serviceSuccess({ ordered: ids });
}

export async function deleteRow(client, { table, id, actorUserId, auditAction = `${table}.delete` }) {
  const supabase = getClient(client);
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) return serviceFailure("DELETE_FAILED", "Unable to delete the record.");

  try {
    await writeSuccessfulAdminMutationAudit({ actorUserId, action: auditAction, entityType: table, entityId: id }, { client: supabase });
  } catch {
    // Mutation already succeeded.
  }

  return serviceSuccess({ id });
}
