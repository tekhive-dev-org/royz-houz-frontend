import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { writeSuccessfulAdminMutationAudit } from "./adminAuthorizationService";

export function serviceSuccess(data, message = "Request completed") {
  return { success: true, data, message };
}

export function serviceFailure(code, message) {
  return { success: false, error: { code, message } };
}

function getClient(client) {
  return client || createAdminServiceRoleClient();
}

const MODERATION_STATUS_BY_ACTION = {
  approve: "approved",
  approved: "approved",
  reject: "rejected",
  rejected: "rejected",
  spam: "spam",
  hide: "hidden",
  hidden: "hidden",
};

export async function listCommentsForModeration(client, { status, search } = {}) {
  const supabase = getClient(client);
  let query = supabase
    .from("blog_comments")
    .select("id, blog_post_id, parent_comment_id, author_name, author_email, body, status, created_at, moderation_notes");

  if (status) query = query.eq("status", status);
  else query = query.in("status", ["pending", "spam", "hidden", "approved", "rejected"]);
  if (search) query = query.or(`author_name.ilike.%${search}%,body.ilike.%${search}%`);

  query = query.order("created_at", { ascending: false }).limit(500);

  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load comments.");
  // email is returned to the admin moderator only (never public), but still
  // masked in the list projection to avoid accidental frontend leakage.
  return serviceSuccess((data || []).map((row) => ({ ...row, author_email: row.author_email || null })));
}

export async function moderateComment(client, { actorUserId, id, action, notes }) {
  const supabase = getClient(client);
  const status = MODERATION_STATUS_BY_ACTION[action];
  if (!status) return serviceFailure("VALIDATION_ERROR", "Unknown moderation action.");

  const { data: existing } = await supabase.from("blog_comments").select("id, status").eq("id", id).maybeSingle();
  if (!existing) return serviceFailure("NOT_FOUND", "Comment was not found.");

  const payload = {
    status,
    published_at: status === "approved" ? new Date().toISOString() : null,
    moderation_notes: notes || null,
  };
  const { error } = await supabase.from("blog_comments").update(payload).eq("id", id);
  if (error) return serviceFailure("MODERATION_FAILED", "Unable to moderate the comment.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: `blog_comments.${action}`, entityType: "blog_comments", entityId: id, newValues: { status } },
    { client: supabase }
  );

  return serviceSuccess({ id, status });
}
