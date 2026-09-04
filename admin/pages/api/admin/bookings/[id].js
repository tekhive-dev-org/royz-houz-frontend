import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { getBooking } from "@/services/server/bookingsService";

export default createAdminCrudHandler("/api/admin/bookings/[id]", {
  GET: { permission: "bookings.read", handler: async (req, res, context) => {
    const id = typeof req.query.id === "string" ? req.query.id : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return sendError(res, "VALIDATION_ERROR", "A valid booking id is required.", { status: 400, requestId: context.requestId });
    const result = await getBooking(null, id);
    if (!result.success) return sendError(res, result.error.code, result.error.message, { status: result.error.code === "NOT_FOUND" ? 404 : 400, requestId: context.requestId });
    return sendSuccess(res, result.data, { requestId: context.requestId });
  } },
});
