import { verifyDonationPayment } from "@/services/content/donationPaymentService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { verifyDonationPaymentSchema } from "@/validators/donationPayment";

export default withApiHandler("/api/donations/payment/verify", {
  POST: async (req, res, context) => {
    const requestContext = {
      ...context,
      route: "/api/donations/payment/verify",
      method: req.method,
    };
    const input = validateRequest(res, verifyDonationPaymentSchema, req.body, requestContext);
    if (!input) return null;
    return sendServiceResult(res, await verifyDonationPayment(input), requestContext);
  },
});
