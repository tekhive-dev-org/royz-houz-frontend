import { getWebsiteSettings } from "@/services/content/websiteSettingsService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/site/settings", {
  GET: async (req, res, context) =>
    sendServiceResult(res, await getWebsiteSettings(), { ...context, route: "/api/site/settings", method: req.method }),
});
