import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { archiveMediaAsset, listMediaLibrary, registerCloudinaryUpload, updateMediaAsset } from "@/services/server/mediaLibraryService";
import { mediaListQuerySchema, mediaUpdateSchema, registerCloudinaryUploadSchema } from "@/validators/media";

export default createAdminCrudHandler("/api/admin/media-library", {
  GET: {
    permission: "media.upload",
    handler: async (req, res) => {
      const parsed = mediaListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }
      const result = await listMediaLibrary(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "media.upload",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: registerCloudinaryUploadSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await registerCloudinaryUpload({ ...input, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "media.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: mediaUpdateSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await updateMediaAsset(null, { id: input.id, actorUserId: context.actor.user.id, fields: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "media.update",
    handler: async (req, res, context) => {
      const id = req.query.id;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A media id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await archiveMediaAsset(null, { id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
