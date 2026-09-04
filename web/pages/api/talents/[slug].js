import { getTalentBySlug } from "@/services/content/talentService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { slugParamSchema } from "@/validators/api";

export default withApiHandler("/api/talents/[slug]", {
  GET: async (req, res, context) => {
    const params = validateRequest(res, slugParamSchema, req.query, {
      ...context,
      route: "/api/talents/[slug]",
      method: req.method,
    });
    if (!params) return null;
    return sendServiceResult(res, await getTalentBySlug(params.slug), {
      ...context,
      route: "/api/talents/[slug]",
      method: req.method,
    });
  },
});
