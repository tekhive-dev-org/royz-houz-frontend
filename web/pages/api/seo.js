import { getSeoMetadata } from "@/services/content/seoService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/seo", {
  GET: async (req, res, context) =>
    sendServiceResult(res, await getSeoMetadata(), { ...context, route: "/api/seo", method: req.method }),
});
