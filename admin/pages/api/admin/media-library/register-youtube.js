import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { registerYouTube } from "@/services/server/mediaLibraryService";
import { registerYouTubeSchema } from "@/validators/media";

export default createAdminCrudHandler("/api/admin/media-library/register-youtube", {
  POST: {
    permission: "media.upload",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: registerYouTubeSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await registerYouTube({ ...input, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
});
