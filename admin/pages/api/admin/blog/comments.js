import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listCommentsForModeration, moderateComment } from "@/services/server/commentModerationService";
import { deleteBlogComment } from "@/services/server/blogService";
import { commentListQuerySchema, commentModerationSchema } from "@/validators/blog";

export default createAdminCrudHandler("/api/admin/blog/comments", {
  GET: {
    permission: "comments.moderate",
    handler: async (req, res) => {
      const parsed = commentListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }
      const result = await listCommentsForModeration(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "comments.moderate",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: commentModerationSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await moderateComment(null, {
        actorUserId: context.actor.user.id,
        id: input.id,
        action: input.action,
        notes: input.notes,
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "comments.moderate",
    handler: async (req, res, context) => {
      const id = req.query.id;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A comment id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await deleteBlogComment(null, { id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
