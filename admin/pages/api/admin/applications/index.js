import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listSubmissions, updateSubmission } from "@/services/server/submissionsService";
import { submissionListQuerySchema, submissionUpdateSchema } from "@/validators/submissions";

function createSubmissionHandler(table, readPermission, writePermission, route) {
  return createAdminCrudHandler(route, {
    GET: {
      permission: readPermission,
      handler: async (req, res) => {
        const parsed = submissionListQuerySchema.safeParse(req.query);
        if (!parsed.success) {
          return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
            status: 400,
            fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
          });
        }
        const result = await listSubmissions(null, { table, ...parsed.data });
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
        return sendSuccess(res, result.data, { meta: { pagination: result.pagination } });
      },
    },
    PUT: {
      permission: writePermission,
      handler: async (req, res, context) => {
        const input = validateRequest({
          res,
          schema: submissionUpdateSchema,
          input: getJsonBody(req),
          requestId: context.requestId,
          logContext: context,
        });
        if (!input) return null;

        const result = await updateSubmission(null, {
          table,
          actorUserId: context.actor.user.id,
          id: input.id,
          fields: { status: input.status, notes: input.notes, assignedTo: input.assignedTo },
        });
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
        return sendSuccess(res, result.data, { requestId: context.requestId });
      },
    },
  });
}

export default createSubmissionHandler("join_applications", "applications.read", "applications.update", "/api/admin/applications");
