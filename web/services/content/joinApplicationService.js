import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { callPublicRpc } from "@/repositories/publicContentRepository";
import { joinApplicationSchema } from "@/validators/joinApplication";
import { parseWithSchema } from "@/validators/common";
import { serviceFailure, serviceSuccess } from "./serviceUtils";

export async function submitJoinApplication(input, { client } = {}) {
  const validation = parseWithSchema(joinApplicationSchema, input);
  if (!validation.success) return serviceFailure(validation.error);

  const values = validation.data;
  const result = await callPublicRpc(client || createSupabaseServiceRoleClient(), "submit_join_application", {
    p_full_name: values.fullName,
    p_stage_name: values.stageName || null,
    p_email: values.email,
    p_phone: values.phone,
    p_date_of_birth: values.dateOfBirth || null,
    p_state_region: values.stateRegion || null,
    p_talent_category: values.talentCategory,
    p_custom_talent_category: values.customTalentCategory || null,
    p_experience_level: values.experienceLevel || null,
    p_years_of_experience: values.yearsOfExperience || null,
    p_short_bio: values.shortBio,
    p_genres_specialties: values.genresSpecialties || null,
    p_social_profiles: values.socialProfiles,
    p_portfolio_urls: values.portfolioUrls,
    p_availability: values.availability,
    p_additional_details: values.additionalDetails,
    p_confirmed_accuracy: values.confirmedAccuracy,
  });
  if (!result.success) return serviceFailure(result.error);

  return serviceSuccess({ id: result.data }, "Your application has been submitted successfully.");
}
