import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { callPublicRpc } from "@/repositories/publicContentRepository";
import { newsletterSubscriptionSchema } from "@/validators/newsletter";
import { parseWithSchema } from "@/validators/common";
import { serviceFailure, serviceSuccess } from "./serviceUtils";

export async function subscribeToNewsletter(input, { client } = {}) {
  const validation = parseWithSchema(newsletterSubscriptionSchema, input);
  if (!validation.success) return serviceFailure(validation.error);
  const values = validation.data;
  const result = await callPublicRpc(client || createSupabaseServiceRoleClient(), "subscribe_to_newsletter", {
    p_email: values.email,
    p_source: values.source,
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess({ id: result.data }, "You have been subscribed to the newsletter.");
}
