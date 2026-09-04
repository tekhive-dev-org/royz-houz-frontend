import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { getDefaultSeo, listSeoRecords, saveDefaultSeo } from "@/services/server/seoAdminService";
import { seoListQuerySchema, seoRecordSchema } from "@/validators/seo";

export default createAdminCrudHandler("/api/admin/seo", {
  GET: {
    permission: "settings.read",
    handler: async (req, res, context) => {
      const parsed = seoListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          requestId: context.requestId,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }

      if (parsed.data.type === "default") {
        const result = await getDefaultSeo(null);
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
        return sendSuccess(res, result.data, { requestId: context.requestId });
      }

      const result = await listSeoRecords(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  PUT: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: seoRecordSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await saveDefaultSeo(null, { actorUserId: context.actor.user.id, seo: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
