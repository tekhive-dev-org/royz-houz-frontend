import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import {
  listContentReports,
  moderateContentReport,
} from "@/services/server/contentReportsService";
import {
  contentReportListSchema,
  contentReportUpdateSchema,
} from "@/validators/contentReports";

export default createAdminCrudHandler("/api/admin/reports", {
  GET: {
    permission: "reports.read",
    handler: async (req, res, context) => {
      const parsed = contentReportListSchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid report filters.", {
          status: 400,
          requestId: context.requestId,
          fields: Object.fromEntries(
            parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])
          ),
        });
      }
      const result = await listContentReports(null, parsed.data);
      if (!result.success) {
        return sendError(res, result.error.code, result.error.message, {
          status: 400,
          requestId: context.requestId,
        });
      }
      return sendSuccess(res, result.data, {
        requestId: context.requestId,
        meta: { pagination: result.pagination },
      });
    },
  },
  PUT: {
    permission: "reports.moderate",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: contentReportUpdateSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return;

      const result = await moderateContentReport(null, {
        actorUserId: context.actor.user.id,
        report: input,
      });
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
