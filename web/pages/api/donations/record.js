import { createDonationRecord } from "@/services/server/donationRecordService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { enforceWriteRateLimit, validateRequest } from "@/utils/apiRequest";
import { sanitizeSubmissionInput } from "@/utils/sanitize";
import { donationRecordSchema } from "@/validators/api";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

export default withApiHandler("/api/donations/record", {
  POST: async (req, res, context) => {
    const requestContext = { ...context, route: "/api/donations/record", method: req.method, successStatus: 201 };
    if (!enforceWriteRateLimit(req, res, requestContext, { namespace: "donation-record", limit: 3, windowMs: 60_000 })) {
      return null;
    }
    const input = validateRequest(res, donationRecordSchema, sanitizeSubmissionInput(req.body), requestContext);
    if (!input) return null;
    return sendServiceResult(res, await createDonationRecord(input), requestContext);
  },
});
