import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { upsertContentRow } from "@/services/server/contentService";
import { siteSettingSchema } from "@/validators/site";

const BLOG_PAGE_SLUG = "blog-page";

export default createAdminCrudHandler("/api/admin/blog-page", {
  GET: {
    permission: "blog.create",
    handler: async (_req, res) => {
      const { data, error } = await createAdminServiceRoleClient()
        .from("site_settings")
        .select("*")
        .eq("slug", BLOG_PAGE_SLUG)
        .maybeSingle();

      if (error) return sendError(res, "QUERY_FAILED", "Unable to load Blog page settings.", { status: 400 });
      return sendSuccess(
        res,
        data || { slug: BLOG_PAGE_SLUG, title: "Blog page", summary: "", content: {}, status: "published" }
      );
    },
  },
  PUT: {
    permission: "blog.update",
    handler: async (req, res, context) => {
      const client = createAdminServiceRoleClient();
      const existing = await client.from("site_settings").select("id").eq("slug", BLOG_PAGE_SLUG).maybeSingle();
      const input = validateRequest({
        res,
        schema: siteSettingSchema,
        input: { ...getJsonBody(req), slug: BLOG_PAGE_SLUG, title: "Blog page" },
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await upsertContentRow(client, {
        table: "site_settings",
        actorUserId: context.actor.user.id,
        row: {
          ...(existing.data?.id ? { id: existing.data.id } : {}),
          slug: BLOG_PAGE_SLUG,
          title: "Blog page",
          summary: input.summary || null,
          content: input.content || {},
          sort_order: 25,
        },
        status: input.status,
        scheduledAt: null,
        auditAction: "blog_page.update",
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
