import { listEventCategories } from "@/services/content/eventService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/events/categories", {
  GET: async (_req, res, context) =>
    sendServiceResult(res, await listEventCategories(), {
      ...context,
      route: "/api/events/categories",
      method: "GET",
    }),
});
