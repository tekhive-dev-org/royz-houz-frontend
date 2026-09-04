import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { getSubmission } from "@/services/server/submissionsService";

export default createAdminCrudHandler("/api/admin/contacts/[id]", {
  GET: {
    permission: "contacts.read",
    handler: async (req, res, context) => {
      const { id } = req.query;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A submission id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await getSubmission(null, { table: "contact_submissions", id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
