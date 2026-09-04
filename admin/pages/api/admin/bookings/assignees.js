import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listBookingAssignees } from "@/services/server/bookingsService";

export default createAdminCrudHandler("/api/admin/bookings/assignees", {
  GET: { permission: "bookings.update", handler: async (_req, res, context) => {
    const result = await listBookingAssignees(null);
    if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
    return sendSuccess(res, result.data, { requestId: context.requestId });
  } },
});
