import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listRecords, updateRecordNotes } from "@/services/server/donationsService";
import { recordListQuerySchema, recordNoteSchema } from "@/validators/donations";

export default createAdminCrudHandler("/api/admin/donations/records", {
  GET: {
    permission: "donations.read",
    handler: async (req, res) => {
      const parsed = recordListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }
      const result = await listRecords(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  PUT: {
    permission: "donations.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: recordNoteSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await updateRecordNotes(null, { actorUserId: context.actor.user.id, id: input.id, notes: input.notes });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
