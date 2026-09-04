import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { upsertContentRow, reorderRows, deleteRow, listRows } from "./contentService";

export function serviceSuccess(data, message = "Request completed") {
  return { success: true, data, message };
}

export function serviceFailure(code, message) {
  return { success: false, error: { code, message } };
}

function getClient(client) {
  return client || createAdminServiceRoleClient();
}

export async function listSections(client, table) {
  return listRows(client, table, { order: { column: "sort_order" } });
}

export async function getSection(client, table, id) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load the section.");
  if (!data) return serviceFailure("NOT_FOUND", "Section was not found.");
  return serviceSuccess(data);
}

export async function saveSection(client, { table, actorUserId, section }) {
  const supabase = getClient(client);

  // Split public fields from base section columns.
  const { slug, title, summary, sortOrder, sort_order, visible, status, scheduledAt, id, ...rest } = section;
  const body = { ...(rest.body || {}), ...rest };
  delete body.body;
  delete body.id;

  const existing = section.id
    ? await supabase.from(table).select("id, status, sort_order").eq("id", section.id).maybeSingle()
    : await supabase.from(table).select("id, status, sort_order").eq("slug", slug).maybeSingle();

  const recordId = section.id || existing.data?.id;

  let finalSortOrder = sortOrder ?? sort_order;
  if (finalSortOrder === undefined || finalSortOrder === null || (!recordId && finalSortOrder === 0)) {
    if (existing.data?.sort_order !== undefined) {
      finalSortOrder = existing.data.sort_order;
    } else {
      const { data: maxRows } = await supabase.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
      finalSortOrder = maxRows && maxRows.length > 0 ? (maxRows[0].sort_order + 1) : 0;
    }
  }

  const payload = {
    slug,
    title,
    summary: summary || null,
    body,
    sort_order: finalSortOrder,
    featured: visible !== false,
  };

  const result = await upsertContentRow(supabase, {
    table,
    actorUserId,
    row: recordId ? { id: recordId, ...payload } : payload,
    status,
    scheduledAt,
    auditAction: existing.data ? `${table}.update` : `${table}.create`,
  });

  if (!result.success) return result;

  try {
    // Record a content revision snapshot.
    await recordRevision(supabase, { table, contentId: result.data.id, actorUserId, snapshot: payload, action: existing.data ? "updated" : "created" });

    // Record publishing activity when the lifecycle changes materially.
    await recordPublishingActivity(supabase, { table, contentId: result.data.id, actorUserId, previousStatus: existing.data?.status || null, newStatus: status, scheduledFor: scheduledAt || null });
  } catch {
    // Non-fatal audit/snapshot recording.
  }

  return result;
}

export async function reorderSections(client, { table, ids, actorUserId }) {
  return reorderRows(client, { table, ids, actorUserId, auditAction: `${table}.reorder` });
}

export async function deleteSection(client, { table, id, actorUserId }) {
  return deleteRow(client, { table, id, actorUserId, auditAction: `${table}.delete` });
}

async function recordRevision(supabase, { table, contentId, actorUserId, snapshot, action }) {
  const { data: latest } = await supabase
    .from("content_revisions")
    .select("revision_number")
    .eq("content_type", table)
    .eq("content_id", contentId)
    .order("revision_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextNumber = (latest?.revision_number || 0) + 1;
  await supabase.from("content_revisions").insert({
    content_type: table,
    content_id: contentId,
    revision_number: nextNumber,
    action,
    snapshot,
    created_by: actorUserId,
  });
}

async function recordPublishingActivity(supabase, { table, contentId, actorUserId, previousStatus, newStatus, scheduledFor }) {
  if (previousStatus === newStatus) return;

  await supabase.from("publishing_activity").insert({
    content_type: table,
    content_id: contentId,
    action: newStatus === "published" ? "published" : newStatus === "archived" ? "archived" : newStatus === "scheduled" ? "scheduled" : "updated",
    previous_status: previousStatus,
    new_status: newStatus,
    scheduled_for: scheduledFor,
    performed_by: actorUserId,
  });
}

/**
 * Generates the same component-facing shape the public adapters produce, so the
 * admin preview mirrors the website exactly. Mirrors web/adapters.
 */
export function buildSectionPreview(sections) {
  const ordered = [...sections].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));
  return ordered.map((section) => ({
    ...(section.body || {}),
    id: section.id,
    slug: section.slug,
    title: section.title,
    summary: section.summary,
    featured: section.featured,
    sortOrder: section.sort_order,
    status: section.status,
    publishedAt: section.published_at || null,
    scheduledAt: section.scheduled_at || null,
  }));
}
