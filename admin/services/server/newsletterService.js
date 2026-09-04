import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { writeSuccessfulAdminMutationAudit } from "./adminAuthorizationService";

function clientOrDefault(client) { return client || createAdminServiceRoleClient(); }
function success(data, message = "Request completed") { return { success: true, data, message }; }
function failure(code, message) { return { success: false, error: { code, message } }; }

export async function listNewsletterSubscriptions(client, { search, status } = {}) {
  const supabase = clientOrDefault(client);
  let query = supabase.from("newsletter_subscriptions").select("*").order("created_at", { ascending: false }).limit(500);
  if (status) query = query.eq("status", status);
  if (search) query = query.ilike("email", `%${search}%`);
  const { data, error } = await query;
  if (error) return failure("QUERY_FAILED", "Unable to load newsletter subscribers.");
  return success(data || []);
}

export async function updateNewsletterSubscription(client, { id, status, actorUserId }) {
  const supabase = clientOrDefault(client);
  const changes = { status, unsubscribed_at: status === "unsubscribed" ? new Date().toISOString() : null, updated_by: actorUserId };
  const { data, error } = await supabase.from("newsletter_subscriptions").update(changes).eq("id", id).select().single();
  if (error) return failure("PERSIST_FAILED", "Unable to update newsletter subscription.");
  await writeSuccessfulAdminMutationAudit({ actorUserId, action: "newsletter_subscriptions.update", entityType: "newsletter_subscriptions", entityId: id, newValues: { status } }, { client: supabase });
  return success(data, "Newsletter subscription updated.");
}

export async function exportNewsletterSubscriptions(client, { status, actorUserId } = {}) {
  const result = await listNewsletterSubscriptions(client, { status });
  if (!result.success) return result;
  const header = ["email", "source", "status", "subscribed_at", "created_at"];
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = [header.join(","), ...result.data.map((item) => header.map((key) => escape(item[key])).join(","))];
  await writeSuccessfulAdminMutationAudit({ actorUserId, action: "newsletter_subscriptions.export", entityType: "newsletter_subscriptions", newValues: { rowCount: result.data.length } }, { client: clientOrDefault(client) });
  return success(rows.join("\n"));
}
