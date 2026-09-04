import { submitBookingRequest } from "@/services/content/bookingService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { enforceWriteRateLimit, validateRequest } from "@/utils/apiRequest";
import { sanitizeSubmissionInput } from "@/utils/sanitize";
import { bookingRequestSchema } from "@/validators/booking";

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default withApiHandler("/api/talents/booking", {
  POST: async (req, res, context) => {
    const requestContext = { ...context, route: "/api/talents/booking", method: req.method, successStatus: 201 };
    if (!enforceWriteRateLimit(req, res, requestContext, { namespace: "talent-booking", limit: 3, windowMs: 10 * 60_000 })) return;
    const input = validateRequest(res, bookingRequestSchema, sanitizeSubmissionInput(req.body), requestContext);
    if (!input) return;
    sendServiceResult(res, await submitBookingRequest(input), requestContext);
  },
});
