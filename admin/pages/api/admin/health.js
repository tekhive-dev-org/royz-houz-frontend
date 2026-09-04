import { sendSuccess } from "@/utils/apiResponse";
import { withAdminApiHandler } from "@/utils/apiHandler";

export default withAdminApiHandler("/api/admin/health", {
  GET: async (_req, res, context) =>
    sendSuccess(
      res,
      {
        status: "ready",
        service: "Royz Houz Admin API",
      },
      { requestId: context.requestId }
    ),
});
