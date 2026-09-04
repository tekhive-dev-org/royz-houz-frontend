import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listProfiles, updateProfileStatus, updateRoleAssignments } from "@/services/server/accessControlService";
import { profileListQuerySchema, profileStatusSchema, roleAssignmentSchema } from "@/validators/accessControl";

export default createAdminCrudHandler("/api/admin/access-control/profiles", {
  GET: {
    permission: "users.manage",
    handler: async (req, res, context) => {
      const parsed = profileListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          requestId: context.requestId,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }
      const result = await listProfiles(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  PUT: {
    permission: "users.manage",
    handler: async (req, res, context) => {
      const body = getJsonBody(req);
      const input = validateRequest({
        res,
        schema: profileStatusSchema.or(roleAssignmentSchema),
        input: body,
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = "status" in input
        ? await updateProfileStatus(null, { actorUserId: context.actor.user.id, userId: input.userId, status: input.status })
        : await updateRoleAssignments(null, { actorUserId: context.actor.user.id, userId: input.userId, roleIds: input.roleIds });

      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
