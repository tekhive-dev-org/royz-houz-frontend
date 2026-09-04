import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listBookings, updateBooking } from "@/services/server/bookingsService";
import { bookingListQuerySchema, bookingUpdateSchema } from "@/validators/bookings";

export default createAdminCrudHandler("/api/admin/bookings", {
  GET: { permission: "bookings.read", handler: async (req, res, context) => {
    const parsed = bookingListQuerySchema.safeParse(req.query);
    if (!parsed.success) return sendError(res, "VALIDATION_ERROR", "Invalid booking filters.", { status: 400, requestId: context.requestId });
    const result = await listBookings(null, parsed.data);
    if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
    return sendSuccess(res, result.data, { requestId: context.requestId, meta: { pagination: result.pagination } });
  } },
  PUT: { permission: "bookings.update", handler: async (req, res, context) => {
    const input = validateRequest({ res, schema: bookingUpdateSchema, input: getJsonBody(req), requestId: context.requestId, logContext: context });
    if (!input) return;
    const result = await updateBooking(null, { actorUserId: context.actor.user.id, booking: input });
    if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
    return sendSuccess(res, result.data, { requestId: context.requestId });
  } },
});
