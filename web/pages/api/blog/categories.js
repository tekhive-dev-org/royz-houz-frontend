import { listBlogCategories } from "@/services/content/blogService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/blog/categories", {
  GET: async (req, res, context) => {
    return sendServiceResult(res, await listBlogCategories(), {
      ...context,
      route: "/api/blog/categories",
      method: req.method,
    });
  },
});
