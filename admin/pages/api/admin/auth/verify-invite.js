import { withAdminApiHandler } from "@/utils/apiHandler";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { validateRequest } from "@/utils/apiRequest";
import { verifyInvitation } from "@/services/server/accessControlService";
import { inviteVerifySchema } from "@/validators/accessControl";

export default withAdminApiHandler("/api/admin/auth/verify-invite", {
  GET: async (req, res, context) => {
    const input = validateRequest({
      res,
      schema: inviteVerifySchema,
      input: { token: req.query.token },
      requestId: context.requestId,
      logContext: context,
    });
    if (!input) return null;

    const result = await verifyInvitation(null, { token: input.token });
    if (!result.success) {
      return sendError(res, result.error.code, result.error.message, {
        status: 400,
        requestId: context.requestId,
      });
    }

    return sendSuccess(res, result.data, { requestId: context.requestId });
  },
});
