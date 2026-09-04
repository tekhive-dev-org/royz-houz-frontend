import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { buildSeoPreview } from "@/services/server/seoAdminService";
import { seoPreviewSchema } from "@/validators/seo";

export default createAdminCrudHandler("/api/admin/seo/preview", {
  POST: {
    permission: "settings.read",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: seoPreviewSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      return sendSuccess(res, buildSeoPreview(input), { requestId: context.requestId });
    },
  },
});
