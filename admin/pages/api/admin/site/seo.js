import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { seoSchema } from "@/validators/site";
import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { writeSuccessfulAdminMutationAudit } from "@/services/server/adminAuthorizationService";

const seoUpdateSchema = seoSchema.extend({ id: z.string().uuid() });

async function getDefaultSeo(supabase) {
  const { data, error } = await supabase.from("seo_metadata").select("*").limit(1).maybeSingle();
  if (error) return { error };
  return { data };
}

export default createAdminCrudHandler("/api/admin/site/seo", {
  GET: {
    permission: "settings.read",
    handler: async (_req, res) => {
      const supabase = createAdminServiceRoleClient();
      const { data, error } = await getDefaultSeo(supabase);
      if (error) return sendError(res, "QUERY_FAILED", "Unable to load default SEO.", { status: 400 });
      return sendSuccess(res, data || null);
    },
  },
  PUT: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: seoUpdateSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const supabase = createAdminServiceRoleClient();
      const { data: existing, error: existingError } = await supabase.from("seo_metadata").select("id").eq("id", input.id).maybeSingle();
      if (existingError || !existing) return sendError(res, "NOT_FOUND", "Default SEO record was not found.", { status: 404, requestId: context.requestId });

      const { data, error } = await supabase
        .from("seo_metadata")
        .update({
          title: input.title,
          summary: input.summary || null,
          canonical_path: input.canonicalPath || null,
          og_title: input.ogTitle || null,
          og_description: input.ogDescription || null,
          og_image_url: input.ogImageUrl || null,
          no_index: input.noIndex,
        })
        .eq("id", input.id)
        .select()
        .single();

      if (error) return sendError(res, "PERSIST_FAILED", "Unable to save default SEO.", { status: 400, requestId: context.requestId });

      await writeSuccessfulAdminMutationAudit(
        { actorUserId: context.actor.user.id, action: "seo_metadata.update", entityType: "seo_metadata", entityId: input.id, newValues: { title: input.title } },
        { client: supabase }
      );

      return sendSuccess(res, data, { requestId: context.requestId });
    },
  },
  POST: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: seoSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const supabase = createAdminServiceRoleClient();

      // Default SEO must target a single site_settings record.
      const { data: setting, error: settingError } = await supabase
        .from("site_settings")
        .upsert({ slug: "default-seo", title: "Default SEO", status: "published", published_at: new Date().toISOString() }, { onConflict: "slug" })
        .select()
        .single();
      if (settingError || !setting) return sendError(res, "PERSIST_FAILED", "Unable to prepare default SEO.", { status: 400, requestId: context.requestId });

      const { data, error } = await supabase
        .from("seo_metadata")
        .insert({
          site_settings_id: setting.id,
          title: input.title,
          summary: input.summary || null,
          canonical_path: input.canonicalPath || null,
          og_title: input.ogTitle || null,
          og_description: input.ogDescription || null,
          og_image_url: input.ogImageUrl || null,
          no_index: input.noIndex,
        })
        .select()
        .single();

      if (error) return sendError(res, "PERSIST_FAILED", "Unable to save default SEO.", { status: 400, requestId: context.requestId });

      await writeSuccessfulAdminMutationAudit(
        { actorUserId: context.actor.user.id, action: "seo_metadata.create", entityType: "seo_metadata", entityId: data.id },
        { client: supabase }
      );

      return sendSuccess(res, data, { status: 201, requestId: context.requestId });
    },
  },
});
