import { getFooter } from "@/services/content/navigationService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/site/footer", {
  GET: async (req, res, context) =>
    sendServiceResult(res, await getFooter(), { ...context, route: "/api/site/footer", method: req.method }),
});
