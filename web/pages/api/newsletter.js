import { subscribeToNewsletter } from "@/services/content/newsletterService";
import { newsletterSubscriptionSchema } from "@/validators/newsletter";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { enforceWriteRateLimit, validateRequest } from "@/utils/apiRequest";
import { sanitizeSubmissionInput } from "@/utils/sanitize";

export default withApiHandler("/api/newsletter", {
  POST: async (req, res, context) => {
    const requestContext = { ...context, route: "/api/newsletter", method: req.method, successStatus: 201 };
    if (!enforceWriteRateLimit(req, res, requestContext, { namespace: "newsletter", limit: 5, windowMs: 60_000 })) return null;
    const input = validateRequest(res, newsletterSubscriptionSchema, sanitizeSubmissionInput(req.body), requestContext);
    if (!input) return null;
    return sendServiceResult(res, await subscribeToNewsletter(input), requestContext);
  },
});
