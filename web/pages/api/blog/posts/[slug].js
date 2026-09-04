import { getBlogPostBySlug } from "@/services/content/blogService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { slugParamSchema } from "@/validators/api";

export default withApiHandler("/api/blog/posts/[slug]", {
  GET: async (req, res, context) => {
    const params = validateRequest(res, slugParamSchema, req.query, {
      ...context,
      route: "/api/blog/posts/[slug]",
      method: req.method,
    });
    if (!params) return null;
    return sendServiceResult(res, await getBlogPostBySlug(params.slug), {
      ...context,
      route: "/api/blog/posts/[slug]",
      method: req.method,
    });
  },
});
