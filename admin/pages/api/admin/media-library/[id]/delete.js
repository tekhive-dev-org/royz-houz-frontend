import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { deleteCloudinaryAsset } from "@/services/server/mediaLibraryService";

export default createAdminCrudHandler("/api/admin/media-library/[id]/delete", {
  DELETE: {
    permission: "media.delete",
    handler: async (req, res, context) => {
      const { id } = req.query;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A media id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await deleteCloudinaryAsset(null, { id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
