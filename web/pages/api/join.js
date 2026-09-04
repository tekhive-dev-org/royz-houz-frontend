import { submitJoinApplication } from "@/services/content/joinApplicationService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { enforceWriteRateLimit, validateRequest } from "@/utils/apiRequest";
import { sanitizeSubmissionInput } from "@/utils/sanitize";
import { joinApplicationSchema } from "@/validators/joinApplication";

export const config = { api: { bodyParser: { sizeLimit: "64kb" } } };

export default withApiHandler("/api/join", {
  POST: async (req, res, context) => {
    const requestContext = { ...context, route: "/api/join", method: req.method, successStatus: 201 };
    if (!enforceWriteRateLimit(req, res, requestContext, { namespace: "join", limit: 3, windowMs: 60_000 })) {
      return null;
    }
    const input = validateRequest(res, joinApplicationSchema, sanitizeSubmissionInput(req.body), requestContext);
    if (!input) return null;
    return sendServiceResult(res, await submitJoinApplication(input), requestContext);
  },
});
