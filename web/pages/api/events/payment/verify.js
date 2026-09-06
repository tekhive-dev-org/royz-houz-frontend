import { verifyEventPayment } from "@/services/content/eventPaymentService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { verifyEventPaymentSchema } from "@/validators/eventPayment";

export default withApiHandler("/api/events/payment/verify", {
  POST: async (req, res, context) => {
    const requestContext = { ...context, route: "/api/events/payment/verify", method: req.method };
    const input = validateRequest(res, verifyEventPaymentSchema, req.body, requestContext);
    if (!input) return null;
    return sendServiceResult(res, await verifyEventPayment(input), requestContext);
  },
});
