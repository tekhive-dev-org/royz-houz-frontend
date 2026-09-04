import { getAuthenticatedAdmin } from "@/services/server/adminAuthorizationService";
import { getDashboardSummary } from "@/services/server/dashboardService";
import { ApiErrorCode, sendError, sendSuccess } from "@/utils/apiResponse";
import { withAdminApiHandler } from "@/utils/apiHandler";
import { parseWithSchema } from "@/validators/common";
import { dashboardQuerySchema } from "@/validators/dashboard";

export default withAdminApiHandler("/api/admin/dashboard", {
  GET: async (req, res, context) => {
    const auth = await getAuthenticatedAdmin(req, res);
    if (auth.status !== "authorized") {
      return sendError(res, ApiErrorCode.ADMIN_ACCESS_REQUIRED, "You are not authorized to view the dashboard.", {
        status: auth.status === "unauthenticated" ? 401 : 403,
        requestId: context.requestId,
      });
    }

    const parsed = parseWithSchema(dashboardQuerySchema, req.query);
    if (!parsed.success) {
      return sendError(res, ApiErrorCode.VALIDATION_ERROR, parsed.error.message, {
        status: 400,
        requestId: context.requestId,
        fields: parsed.error.fields,
      });
    }

    const summary = await getDashboardSummary(auth.user.id, parsed.data, { client: undefined });
    return sendSuccess(res, summary, { requestId: context.requestId });
  },
});
