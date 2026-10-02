import { getDefaultSeoMetadata } from "@/services/content/seoService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/seo/default", {
  GET: async (req, res, context) =>
    sendServiceResult(res, await getDefaultSeoMetadata(), {
      ...context,
      route: "/api/seo/default",
      method: req.method,
    }),
});
