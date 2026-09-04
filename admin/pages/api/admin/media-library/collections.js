import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { assignCollections, listMediaCollections } from "@/services/server/mediaLibraryService";
import { collectionAssignSchema } from "@/validators/media";

export default createAdminCrudHandler("/api/admin/media-library/collections", {
  GET: {
    permission: "media.upload",
    handler: async (_req, res) => {
      const result = await listMediaCollections(null);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "media.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: collectionAssignSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await assignCollections(null, { assetId: input.assetId, collectionIds: input.collectionIds, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
