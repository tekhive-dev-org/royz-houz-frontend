import { listEvents } from "@/services/content/eventService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { catalogQuerySchema } from "@/validators/api";

export default withApiHandler("/api/events", {
  GET: async (req, res, context) => {
    const query = validateRequest(res, catalogQuerySchema, req.query, {
      ...context,
      route: "/api/events",
      method: req.method,
    });
    if (!query) return null;
    return sendServiceResult(res, await listEvents(query), { ...context, route: "/api/events", method: req.method });
  },
});
