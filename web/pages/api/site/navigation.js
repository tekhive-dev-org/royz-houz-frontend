import { getNavigation } from "@/services/content/navigationService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/site/navigation", {
  GET: async (req, res, context) =>
    sendServiceResult(res, await getNavigation(), { ...context, route: "/api/site/navigation", method: req.method }),
});
