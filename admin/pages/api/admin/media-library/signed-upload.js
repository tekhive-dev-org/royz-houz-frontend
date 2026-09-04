import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { createSignedUpload } from "@/services/server/mediaLibraryService";
import { signedUploadRequestSchema } from "@/validators/media";

export default createAdminCrudHandler("/api/admin/media-library/signed-upload", {
  POST: {
    permission: "media.upload",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: signedUploadRequestSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = createSignedUpload(input);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
