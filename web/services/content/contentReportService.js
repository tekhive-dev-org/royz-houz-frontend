import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { callPublicRpc } from "@/repositories/publicContentRepository";
import { contentReportSchema } from "@/validators/contentReport";
import { parseWithSchema } from "@/validators/common";
import { serviceFailure, serviceSuccess } from "./serviceUtils";

export async function submitContentReport(input, { client } = {}) {
  const validation = parseWithSchema(contentReportSchema, input);
  if (!validation.success) return serviceFailure(validation.error);

  const values = validation.data;
  const result = await callPublicRpc(
    client || createSupabaseServiceRoleClient(),
    "submit_content_report",
    {
      p_submission_key: values.submissionKey,
      p_target_type: values.targetType,
      p_target_id: values.targetId,
      p_talent_id: values.talentId || null,
      p_target_key: values.targetKey,
      p_target_title: values.targetTitle,
      p_reason_code: values.reason,
      p_details: values.details || null,
      p_reporter_email: values.reporterEmail || null,
    }
  );
  if (!result.success) return serviceFailure(result.error);

  return serviceSuccess(
    { id: result.data },
    "Thank you. Your report has been submitted for review."
  );
}
