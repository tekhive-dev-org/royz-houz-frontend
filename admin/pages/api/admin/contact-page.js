import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { upsertContentRow } from "@/services/server/contentService";
import { siteSettingSchema } from "@/validators/site";

const CONTACT_PAGE_SLUG = "contact-page";

export default createAdminCrudHandler("/api/admin/contact-page", {
  GET: {
    permission: "contacts.read",
    handler: async (_req, res) => {
      const { data, error } = await createAdminServiceRoleClient()
        .from("site_settings")
        .select("*")
        .eq("slug", CONTACT_PAGE_SLUG)
        .maybeSingle();

      if (error) return sendError(res, "QUERY_FAILED", "Unable to load Contact page settings.", { status: 400 });
      return sendSuccess(
        res,
        data || { slug: CONTACT_PAGE_SLUG, title: "Contact page", summary: "", content: {}, status: "published" }
      );
    },
  },
  PUT: {
    permission: "contacts.update",
    handler: async (req, res, context) => {
      const client = createAdminServiceRoleClient();
      const existing = await client.from("site_settings").select("id").eq("slug", CONTACT_PAGE_SLUG).maybeSingle();
      const input = validateRequest({
        res,
        schema: siteSettingSchema,
        input: { ...getJsonBody(req), slug: CONTACT_PAGE_SLUG, title: "Contact page" },
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await upsertContentRow(client, {
        table: "site_settings",
        actorUserId: context.actor.user.id,
        row: {
          ...(existing.data?.id ? { id: existing.data.id } : {}),
          slug: CONTACT_PAGE_SLUG,
          title: "Contact page",
          summary: input.summary || null,
          content: input.content || {},
          sort_order: 35,
        },
        status: input.status,
        scheduledAt: null,
        auditAction: "contact_page.update",
      });

      if (!result.success) {
        return sendError(res, result.error.code, result.error.message, {
          status: 400,
          requestId: context.requestId,
        });
      }

      return sendSuccess(res, result.data, {
        message: "Contact page settings updated successfully.",
        requestId: context.requestId,
      });
    },
  },
});
