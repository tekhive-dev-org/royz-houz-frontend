import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { createPaginationMeta, normalizePagination } from "@/utils/pagination";

const STATUSES = ["pending", "paid", "failed", "cancelled"];

export async function listTicketPayments(client, { page, limit, search, status } = {}) {
  const supabase = client || createAdminServiceRoleClient();
  const pagination = normalizePagination({ page, limit });
  let query = supabase.from("event_ticket_orders").select("*, events(title, slug)", { count: "exact" }).order("created_at", { ascending: false }).range(pagination.from, pagination.to);
  if (status && STATUSES.includes(status)) query = query.eq("status", status);
  if (search) query = query.or(`reference.ilike.%${search}%,tier_name.ilike.%${search}%`);
  const { data, error, count } = await query;
  if (error) return { success: false, error: { code: "QUERY_FAILED", message: "Unable to load ticket payments." } };
  return { success: true, data: data || [], pagination: createPaginationMeta({ page: pagination.page, limit: pagination.limit, total: count || 0 }) };
}

export async function getTicketPayment(client, id) {
  const supabase = client || createAdminServiceRoleClient();
  const { data, error } = await supabase.from("event_ticket_orders").select("*, events(title, slug)").eq("id", id).maybeSingle();
  if (error) return { success: false, error: { code: "QUERY_FAILED", message: "Unable to load the payment." } };
  if (!data) return { success: false, error: { code: "NOT_FOUND", message: "Payment not found." } };
  return { success: true, data };
}

export async function exportTicketPayments(client, filters = {}) {
  const result = await listTicketPayments(client, { ...filters, page: 1, limit: 1000 });
  if (!result.success) return result;
  const columns = ["reference", "event", "tier", "quantity", "amount_ngn", "status", "paystack_transaction_id", "customer_email", "created_at", "paid_at"];
  const escape = (value) => { const text = value == null ? "" : String(value); return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text; };
  const rows = [columns.join(",")];
  result.data.forEach((payment) => rows.push([payment.reference, payment.events?.title, payment.tier_name, payment.quantity, Number(payment.amount_kobo || 0) / 100, payment.status, payment.paystack_transaction_id, payment.customer?.email, payment.created_at, payment.paid_at].map(escape).join(",")));
  return { success: true, data: rows.join("\n") };
}
