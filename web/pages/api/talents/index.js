import { listTalents } from "@/services/content/talentService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { catalogQuerySchema } from "@/validators/api";

export default withApiHandler("/api/talents", {
  GET: async (req, res, context) => {
    const query = validateRequest(res, catalogQuerySchema, req.query, {
      ...context,
      route: "/api/talents",
      method: req.method,
    });
    if (!query) return null;
    return sendServiceResult(res, await listTalents(query), { ...context, route: "/api/talents", method: req.method });
  },
});
