import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { callPublicRpc } from "@/repositories/publicContentRepository";
import { contactSubmissionSchema } from "@/validators/contact";
import { parseWithSchema } from "@/validators/common";
import { serviceFailure, serviceSuccess } from "./serviceUtils";

export async function submitContactSubmission(input, { client } = {}) {
  const validation = parseWithSchema(contactSubmissionSchema, input);
  if (!validation.success) return serviceFailure(validation.error);

  const values = validation.data;
  const result = await callPublicRpc(client || createSupabaseServiceRoleClient(), "submit_contact_submission", {
    p_first_name: values.firstName,
    p_last_name: values.lastName || null,
    p_email: values.email,
    p_phone: values.phone || null,
    p_country_code: values.countryCode || null,
    p_reason: values.reason || null,
    p_message: values.message,
  });
  if (!result.success) return serviceFailure(result.error);

  return serviceSuccess({ id: result.data }, "Your message has been submitted successfully.");
}
