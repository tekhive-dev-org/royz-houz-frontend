import { initializeEventPayment } from "@/services/content/eventPaymentService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { sanitizeSubmissionInput } from "@/utils/sanitize";
import { initializeEventPaymentSchema } from "@/validators/eventPayment";

export default withApiHandler("/api/events/payment/initialize", {
  POST: async (req, res, context) => {
    const requestContext = { ...context, route: "/api/events/payment/initialize", method: req.method };
    const input = validateRequest(res, initializeEventPaymentSchema, sanitizeSubmissionInput(req.body), requestContext);
    if (!input) return null;
    return sendServiceResult(res, await initializeEventPayment(input), requestContext);
  },
});
