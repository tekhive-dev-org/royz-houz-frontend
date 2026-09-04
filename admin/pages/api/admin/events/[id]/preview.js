import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { buildEventPreview, getEvent } from "@/services/server/eventsService";

export default createAdminCrudHandler("/api/admin/events/[id]/preview", {
  GET: {
    permission: "events.create",
    handler: async (req, res, context) => {
      const { id } = req.query;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "An event id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await getEvent(null, id);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, buildEventPreview(result.data), { requestId: context.requestId });
    },
  },
});
