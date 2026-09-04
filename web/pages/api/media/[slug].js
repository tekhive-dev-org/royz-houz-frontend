import { getMediaBySlug } from "@/services/content/mediaService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { slugParamSchema } from "@/validators/api";

export default withApiHandler("/api/media/[slug]", {
  GET: async (req, res, context) => {
    const params = validateRequest(res, slugParamSchema, req.query, {
      ...context,
      route: "/api/media/[slug]",
      method: req.method,
    });
    if (!params) return null;
    return sendServiceResult(res, await getMediaBySlug(params.slug), {
      ...context,
      route: "/api/media/[slug]",
      method: req.method,
    });
  },
});
