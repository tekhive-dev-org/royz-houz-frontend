import { getAuthenticatedAdmin } from "@/services/server/adminAuthorizationService";
import { ApiErrorCode, sendError, sendSuccess } from "@/utils/apiResponse";
import { withAdminApiHandler } from "@/utils/apiHandler";

export default withAdminApiHandler("/api/admin/auth/session", {
  GET: async (req, res, context) => {
    const result = await getAuthenticatedAdmin(req, res);

    if (result.status === "unauthenticated") {
      return sendError(res, ApiErrorCode.SESSION_EXPIRED, "Your session has expired. Please sign in again.", {
        status: 401,
        requestId: context.requestId,
      });
    }
    if (result.status === "unauthorized") {
      return sendError(res, ApiErrorCode.ADMIN_ACCESS_REQUIRED, "You are not authorized to access this resource.", {
        status: 403,
        requestId: context.requestId,
      });
    }

    return sendSuccess(
      res,
      {
        user: { id: result.user.id, email: result.user.email || null },
        admin: result.admin,
      },
      { requestId: context.requestId }
    );
  },
});
