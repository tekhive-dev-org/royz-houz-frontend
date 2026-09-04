import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listAuditLogs } from "@/services/server/accessControlService";
import { auditLogQuerySchema } from "@/validators/accessControl";

export default createAdminCrudHandler("/api/admin/access-control/audit-logs", {
  GET: {
    permission: "audit.read",
    handler: async (req, res, context) => {
      const parsed = auditLogQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          requestId: context.requestId,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }
      const result = await listAuditLogs(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId, meta: { pagination: result.pagination } });
    },
  },
});
