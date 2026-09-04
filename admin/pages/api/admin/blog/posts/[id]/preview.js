import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { buildBlogPostPreview, getBlogPost } from "@/services/server/blogService";

export default createAdminCrudHandler("/api/admin/blog/posts/[id]/preview", {
  GET: {
    permission: "blog.create",
    handler: async (req, res, context) => {
      const { id } = req.query;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A post id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await getBlogPost(null, id);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, buildBlogPostPreview(result.data), { requestId: context.requestId });
    },
  },
});
