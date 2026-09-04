import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { createInvitation, listInvitations, revokeInvitation } from "@/services/server/accessControlService";
import { inviteCreateSchema, inviteRevokeSchema } from "@/validators/accessControl";

export default createAdminCrudHandler("/api/admin/access-control/invitations", {
  GET: {
    permission: "users.manage",
    handler: async (_req, res, context) => {
      const result = await listInvitations(null);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  POST: {
    permission: "users.manage",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: inviteCreateSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await createInvitation(null, { actorUserId: context.actor.user.id, email: input.email, roleId: input.roleId });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "users.manage",
    handler: async (req, res, context) => {
      const body = getJsonBody(req);
      const input = validateRequest({
        res,
        schema: inviteRevokeSchema,
        input: { id: req.query.id, ...body },
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await revokeInvitation(null, { actorUserId: context.actor.user.id, id: input.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
