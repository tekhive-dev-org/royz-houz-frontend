import { getHomepageContent } from "@/services/content/homepageService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/home", {
  GET: async (req, res, context) =>
    sendServiceResult(res, await getHomepageContent(), { ...context, route: "/api/home", method: req.method }),
});
