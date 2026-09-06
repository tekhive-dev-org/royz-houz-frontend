import { withAdminApiHandler } from "@/utils/apiHandler";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { acceptInvitation } from "@/services/server/accessControlService";
import { inviteAcceptSchema } from "@/validators/accessControl";

export default withAdminApiHandler("/api/admin/auth/accept-invite", {
  POST: async (req, res, context) => {
    const input = validateRequest({
      res,
      schema: inviteAcceptSchema,
      input: getJsonBody(req),
      requestId: context.requestId,
      logContext: context,
    });
    if (!input) return null;

    const result = await acceptInvitation(null, {
      token: input.token,
      displayName: input.displayName,
      password: input.password,
    });

    if (!result.success) {
      return sendError(res, result.error.code, result.error.message, {
        status: 400,
        requestId: context.requestId,
      });
    }

    return sendSuccess(res, result.data, {
      status: 200,
      requestId: context.requestId,
    });
  },
});
