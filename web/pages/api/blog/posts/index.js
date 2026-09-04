import { listBlogPosts } from "@/services/content/blogService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { validateRequest } from "@/utils/apiRequest";
import { catalogQuerySchema } from "@/validators/api";

export default withApiHandler("/api/blog/posts", {
  GET: async (req, res, context) => {
    const query = validateRequest(res, catalogQuerySchema, req.query, {
      ...context,
      route: "/api/blog/posts",
      method: req.method,
    });
    if (!query) return null;
    return sendServiceResult(res, await listBlogPosts(query), {
      ...context,
      route: "/api/blog/posts",
      method: req.method,
    });
  },
});
