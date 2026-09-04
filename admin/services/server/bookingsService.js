import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { createPaginationMeta, normalizePagination } from "@/utils/pagination";

function ok(data, message = "Request completed", pagination = null) { return { success: true, data, message, pagination }; }
function fail(code, message) { return { success: false, error: { code, message } }; }
function client(value) { return value || createAdminServiceRoleClient(); }
const FIELDS = "id, reference, talent_id, talent_slug_snapshot, talent_name_snapshot, first_name, last_name, email, phone, event_type, event_date, event_location, event_description, budget, workflow_status, internal_notes, assigned_to, created_at, updated_at";

export async function listBookings(supabase, filters = {}) {
  const db = client(supabase);
  const pagination = normalizePagination(filters);
  let query = db.from("booking_requests").select(FIELDS, { count: "exact" });
  if (filters.status) query = query.eq("workflow_status", filters.status);
  if (filters.search) query = query.or(`reference.ilike.%${filters.search}%,talent_name_snapshot.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
  const { data, error, count } = await query.order("created_at", { ascending: false }).range(pagination.from, pagination.to);
  if (error) return fail("QUERY_FAILED", "Unable to load booking requests.");
  return ok(data || [], "Booking requests loaded.", createPaginationMeta({ page: pagination.page, limit: pagination.limit, total: count || 0 }));
}

export async function getBooking(supabase, id) {
  const { data, error } = await client(supabase).from("booking_requests").select(FIELDS).eq("id", id).maybeSingle();
  if (error) return fail("QUERY_FAILED", "Unable to load the booking request.");
  if (!data) return fail("NOT_FOUND", "Booking request was not found.");
  return ok(data);
}

export async function listBookingAssignees(supabase) {
  const { data, error } = await client(supabase).from("admin_profiles").select("user_id, display_name").eq("status", "active").order("display_name");
  if (error) return fail("QUERY_FAILED", "Unable to load booking assignees.");
  return ok((data || []).map((item) => ({ id: item.user_id, displayName: item.display_name })));
}

export async function updateBooking(supabase, { actorUserId, booking }) {
  const { data, error } = await client(supabase).rpc("admin_update_booking_request", {
    p_actor_user_id: actorUserId,
    p_booking_id: booking.id,
    p_workflow_status: booking.status || null,
    p_assigned_to: booking.assignedTo === undefined ? null : booking.assignedTo,
    p_set_assignment: booking.assignedTo !== undefined,
    p_internal_notes: booking.internalNotes === undefined ? null : booking.internalNotes,
    p_set_internal_notes: booking.internalNotes !== undefined,
  });
  if (error) return fail("PERSIST_FAILED", "Unable to update the booking request.");
  return ok(Array.isArray(data) ? data[0] : data, "Booking request updated.");
}
