import { listMedia } from "@/services/content/mediaService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { mediaQuerySchema } from "@/validators/api";

export default withApiHandler("/api/media", {
  GET: async (req, res, context) => {
    const query = validateRequest(res, mediaQuerySchema, req.query, {
      ...context,
      route: "/api/media",
      method: req.method,
    });
    if (!query) return null;
    return sendServiceResult(res, await listMedia(query), { ...context, route: "/api/media", method: req.method });
  },
});
