import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { upsertContentRow } from "@/services/server/contentService";
import { siteSettingSchema } from "@/validators/site";

const MEDIA_PAGE_SLUG = "media-page";

export default createAdminCrudHandler("/api/admin/media-page", {
  GET: {
    permission: "media.upload",
    handler: async (_req, res) => {
      const { data, error } = await createAdminServiceRoleClient().from("site_settings").select("*").eq("slug", MEDIA_PAGE_SLUG).maybeSingle();
      if (error) return sendError(res, "QUERY_FAILED", "Unable to load Media page settings.", { status: 400 });
      return sendSuccess(res, data || { slug: MEDIA_PAGE_SLUG, title: "Media page", summary: "", content: {}, status: "draft" });
    },
  },
  PUT: {
    permission: "media.update",
    handler: async (req, res, context) => {
      const client = createAdminServiceRoleClient();
      const existing = await client.from("site_settings").select("id").eq("slug", MEDIA_PAGE_SLUG).maybeSingle();
      const input = validateRequest({
        res,
        schema: siteSettingSchema,
        input: { ...getJsonBody(req), slug: MEDIA_PAGE_SLUG, title: "Media page" },
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await upsertContentRow(client, {
        table: "site_settings",
        actorUserId: context.actor.user.id,
        row: {
          ...(existing.data?.id ? { id: existing.data.id } : {}),
          slug: MEDIA_PAGE_SLUG,
          title: "Media page",
          summary: input.summary || null,
          content: input.content || {},
          sort_order: 20,
        },
        status: input.status,
        scheduledAt: null,
        auditAction: "media_page.update",
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
