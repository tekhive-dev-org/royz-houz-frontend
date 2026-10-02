import { initializeDonationPayment } from "@/services/content/donationPaymentService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { sanitizeSubmissionInput } from "@/utils/sanitize";
import { initializeDonationPaymentSchema } from "@/validators/donationPayment";

export default withApiHandler("/api/donations/payment/initialize", {
  POST: async (req, res, context) => {
    const requestContext = {
      ...context,
      route: "/api/donations/payment/initialize",
      method: req.method,
    };
    const input = validateRequest(
      res,
      initializeDonationPaymentSchema,
      sanitizeSubmissionInput(req.body),
      requestContext
    );
    if (!input) return null;
    return sendServiceResult(res, await initializeDonationPayment(input), requestContext);
  },
});
