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

const SEARCH_COLUMNS = {
  contact_submissions: ["first_name", "last_name", "email", "reason", "message"],
  join_applications: ["full_name", "email", "reference", "talent_category"],
};

export async function listSubmissions(client, { table, page, limit, search, status, assignedTo } = {}) {
  const supabase = getClient(client);
  const pagination = normalizePagination({ page, limit });
  let query = supabase.from(table).select("*", { count: "exact" });

  if (status) query = query.eq("workflow_status", status);
  if (assignedTo) query = query.eq("assigned_to", assignedTo);
  if (search) {
    const expression = SEARCH_COLUMNS[table].map((column) => `${column}.ilike.%${search}%`).join(",");
    query = query.or(expression);
  }

  query = query.order("created_at", { ascending: false }).range(pagination.from, pagination.to);

  const { data, error, count } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load submissions.");

  return {
    ...serviceSuccess(data || [], "Submissions loaded."),
    pagination: createPaginationMeta({ page: pagination.page, limit: pagination.limit, total: count || 0 }),
  };
}

export async function getSubmission(client, { table, id }) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from(table).select("*").eq("id", id).maybeSingle();
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load the submission.");
  if (!data) return serviceFailure("NOT_FOUND", "Submission was not found.");
  return serviceSuccess(data);
}

export async function listAdminUsers(client) {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from("admin_profiles")
    .select("user_id, display_name, status")
    .eq("status", "active")
    .order("display_name", { ascending: true });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load administrators.");
  return serviceSuccess(data || []);
}

export async function updateSubmission(client, { table, actorUserId, id, fields }) {
  const supabase = getClient(client);
  const changes = {};
  if (fields.status) changes.workflow_status = fields.status;
  if (fields.notes !== undefined) changes.internal_notes = fields.notes;
  if (fields.assignedTo !== undefined) changes.assigned_to = fields.assignedTo;
  changes.updated_by = actorUserId;

  const { data, error } = await supabase.from(table).update(changes).eq("id", id).select().single();
  if (error) return serviceFailure("PERSIST_FAILED", "Unable to update the submission.");

  await writeSuccessfulAdminMutationAudit(
    {
      actorUserId,
      action: `${table}.update`,
      entityType: table,
      entityId: id,
      newValues: { workflow_status: data.workflow_status, assigned_to: data.assigned_to || null, has_notes: Boolean(data.internal_notes) },
    },
    { client: supabase }
  );

  return serviceSuccess(data);
}

function csvEscape(value) {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export async function exportSubmissionsCsv(client, { table, actorUserId, filters = {} }) {
  const result = await listSubmissions(client, { table, ...filters, limit: 1000 });
  if (!result.success) return result;

  const header =
    table === "contact_submissions"
      ? ["id", "first_name", "last_name", "email", "phone", "reason", "message", "status", "workflow_status", "created_at"]
      : ["id", "reference", "full_name", "email", "phone", "talent_category", "experience_level", "status", "workflow_status", "created_at"];

  const lines = [header.map(csvEscape).join(",")];
  for (const row of result.data) {
    lines.push(header.map((column) => csvEscape(row[column])).join(","));
  }

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: `${table}.export`, entityType: table, newValues: { rowCount: result.data.length, filters } },
    { client: getClient(client) }
  );

  return serviceSuccess(lines.join("\n"));
}
