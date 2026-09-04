import { getEventBySlug } from "@/services/content/eventService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { slugParamSchema } from "@/validators/api";

export default withApiHandler("/api/events/[slug]", {
  GET: async (req, res, context) => {
    const params = validateRequest(res, slugParamSchema, req.query, {
      ...context,
      route: "/api/events/[slug]",
      method: req.method,
    });
    if (!params) return null;
    return sendServiceResult(res, await getEventBySlug(params.slug), {
      ...context,
      route: "/api/events/[slug]",
      method: req.method,
    });
  },
});
