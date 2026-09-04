import { submitContentReport } from "@/services/content/contentReportService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { enforceWriteRateLimit, validateRequest } from "@/utils/apiRequest";
import { sanitizeSubmissionInput } from "@/utils/sanitize";
import { contentReportSchema } from "@/validators/contentReport";

export const config = { api: { bodyParser: { sizeLimit: "8kb" } } };

export default withApiHandler("/api/reports", {
  POST: async (req, res, context) => {
    const requestContext = {
      ...context,
      route: "/api/reports",
      method: req.method,
      successStatus: 201,
    };
    if (
      !enforceWriteRateLimit(req, res, requestContext, {
        namespace: "content-reports",
        limit: 5,
        windowMs: 10 * 60_000,
      })
    ) {
      return;
    }

    const input = validateRequest(
      res,
      contentReportSchema,
      sanitizeSubmissionInput(req.body),
      requestContext
    );
    if (!input) return;

    sendServiceResult(res, await submitContentReport(input), requestContext);
  },
});
