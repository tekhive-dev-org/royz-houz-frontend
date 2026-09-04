import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { getSeoRecord, saveSeoRecord } from "@/services/server/seoAdminService";
import { seoRecordSchema } from "@/validators/seo";

export default createAdminCrudHandler("/api/admin/seo/records", {
  GET: {
    permission: "settings.read",
    handler: async (req, res, context) => {
      const { type, id } = req.query;
      if (typeof type !== "string" || typeof id !== "string") {
        return sendError(res, "VALIDATION_ERROR", "A content type and id are required.", { status: 400, requestId: context.requestId });
      }
      const result = await getSeoRecord(null, { type, id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  PUT: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const { type, id } = req.query;
      const input = validateRequest({
        res,
        schema: seoRecordSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input || typeof type !== "string" || typeof id !== "string") {
        return sendError(res, "VALIDATION_ERROR", "A content type, id, and SEO fields are required.", { status: 400, requestId: context.requestId });
      }
      const result = await saveSeoRecord(null, { type, id, actorUserId: context.actor.user.id, seo: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
