import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { callPublicRpc } from "@/repositories/publicContentRepository";
import { bookingRequestSchema } from "@/validators/booking";
import { parseWithSchema } from "@/validators/common";
import { serviceFailure, serviceSuccess } from "./serviceUtils";

export async function submitBookingRequest(input, { client } = {}) {
  const validation = parseWithSchema(bookingRequestSchema, input);
  if (!validation.success) return serviceFailure(validation.error);
  const values = validation.data;
  const result = await callPublicRpc(client || createSupabaseServiceRoleClient(), "submit_booking_request", {
    p_submission_key: values.submissionKey,
    p_talent_id: values.talentId,
    p_talent_slug: values.talentSlug,
    p_talent_name: values.talentName,
    p_first_name: values.firstName,
    p_last_name: values.lastName,
    p_email: values.email,
    p_phone: values.phone,
    p_event_type: values.eventType,
    p_event_date: values.eventDate,
    p_event_location: values.eventLocation,
    p_event_description: values.eventDescription,
    p_budget: values.budget || null,
    p_agreed_to_terms: values.agreedToTerms,
  });
  if (!result.success) return serviceFailure(result.error);
  const record = Array.isArray(result.data) ? result.data[0] : result.data;
  return serviceSuccess({ id: record?.id, reference: record?.reference }, "Your booking request has been submitted.");
}
