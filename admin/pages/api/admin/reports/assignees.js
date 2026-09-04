import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listReportAssignees } from "@/services/server/contentReportsService";

export default createAdminCrudHandler("/api/admin/reports/assignees", {
  GET: {
    permission: "reports.moderate",
    handler: async (_req, res, context) => {
      const result = await listReportAssignees(null);
      if (!result.success) {
        return sendError(res, result.error.code, result.error.message, {
          status: 400,
          requestId: context.requestId,
        });
      }
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
