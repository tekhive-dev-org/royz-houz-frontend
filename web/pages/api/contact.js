import { submitContactSubmission } from "@/services/content/contactService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { enforceWriteRateLimit, validateRequest } from "@/utils/apiRequest";
import { sanitizeSubmissionInput } from "@/utils/sanitize";
import { contactSubmissionSchema } from "@/validators/contact";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

export default withApiHandler("/api/contact", {
  POST: async (req, res, context) => {
    const requestContext = { ...context, route: "/api/contact", method: req.method, successStatus: 201 };
    if (!enforceWriteRateLimit(req, res, requestContext, { namespace: "contact", limit: 5, windowMs: 60_000 })) {
      return null;
    }
    const input = validateRequest(res, contactSubmissionSchema, sanitizeSubmissionInput(req.body), requestContext);
    if (!input) return null;
    return sendServiceResult(res, await submitContactSubmission(input), requestContext);
  },
});
