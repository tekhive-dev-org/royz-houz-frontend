import { getAboutContent } from "@/services/content/aboutService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/about", {
  GET: async (req, res, context) =>
    sendServiceResult(res, await getAboutContent(), { ...context, route: "/api/about", method: req.method }),
});
