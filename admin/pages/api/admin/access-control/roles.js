import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listPermissions, listRoles, saveRole } from "@/services/server/accessControlService";
import { roleSchema } from "@/validators/accessControl";

export default createAdminCrudHandler("/api/admin/access-control/roles", {
  GET: {
    permission: "users.manage",
    handler: async (req, res, context) => {
      const { include } = req.query;
      if (include === "permissions") {
        const result = await listPermissions(null);
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
        return sendSuccess(res, result.data, { requestId: context.requestId });
      }
      const result = await listRoles(null);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  POST: {
    permission: "users.manage",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: roleSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await saveRole(null, { actorUserId: context.actor.user.id, role: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "users.manage",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: roleSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input || !input.id) {
        return sendError(res, "VALIDATION_ERROR", "A role id is required.", { status: 400, requestId: context.requestId });
      }

      const result = await saveRole(null, { actorUserId: context.actor.user.id, role: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
