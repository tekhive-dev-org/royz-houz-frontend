import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { upsertContentRow } from "@/services/server/contentService";
import { siteSettingSchema } from "@/validators/site";

const DONATION_PAGE_SLUG = "donation-page";

export default createAdminCrudHandler("/api/admin/donation-page", {
  GET: {
    permission: "donations.read",
    handler: async (_req, res) => {
      const { data, error } = await createAdminServiceRoleClient()
        .from("site_settings")
        .select("*")
        .eq("slug", DONATION_PAGE_SLUG)
        .maybeSingle();

      if (error) return sendError(res, "QUERY_FAILED", "Unable to load Donation page settings.", { status: 400 });
      return sendSuccess(
        res,
        data || { slug: DONATION_PAGE_SLUG, title: "Donation page", summary: "", content: {}, status: "published" }
      );
    },
  },
  PUT: {
    permission: "donations.update",
    handler: async (req, res, context) => {
      const client = createAdminServiceRoleClient();
      const existing = await client.from("site_settings").select("id").eq("slug", DONATION_PAGE_SLUG).maybeSingle();
      const input = validateRequest({
        res,
        schema: siteSettingSchema,
        input: { ...getJsonBody(req), slug: DONATION_PAGE_SLUG, title: "Donation page" },
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await upsertContentRow(client, {
        table: "site_settings",
        actorUserId: context.actor.user.id,
        row: {
          ...(existing.data?.id ? { id: existing.data.id } : {}),
          slug: DONATION_PAGE_SLUG,
          title: "Donation page",
          summary: input.summary || null,
          content: input.content || {},
          sort_order: 30,
        },
        status: input.status,
        scheduledAt: null,
        auditAction: "donation_page.update",
      });

      if (!result.success) {
        return sendError(res, result.error.code, result.error.message, {
          status: 400,
          requestId: context.requestId,
        });
      }
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
