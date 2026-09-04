import { listPublishedBlogComments, submitBlogComment } from "@/services/content/blogCommentService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";
import { enforceWriteRateLimit, validateRequest } from "@/utils/apiRequest";
import { sanitizeSubmissionInput } from "@/utils/sanitize";
import { blogCommentSchema, commentQuerySchema } from "@/validators/api";

export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };

export default withApiHandler("/api/blog/comments", {
  GET: async (req, res, context) => {
    const query = validateRequest(res, commentQuerySchema, req.query, {
      ...context,
      route: "/api/blog/comments",
      method: req.method,
    });
    if (!query) return null;
    return sendServiceResult(res, await listPublishedBlogComments(query.postId), {
      ...context,
      route: "/api/blog/comments",
      method: req.method,
    });
  },
  POST: async (req, res, context) => {
    const requestContext = { ...context, route: "/api/blog/comments", method: req.method, successStatus: 201 };
    if (!enforceWriteRateLimit(req, res, requestContext, { namespace: "blog-comments", limit: 5, windowMs: 60_000 })) {
      return null;
    }
    const input = validateRequest(res, blogCommentSchema, sanitizeSubmissionInput(req.body), requestContext);
    if (!input) return null;
    return sendServiceResult(res, await submitBlogComment(input), requestContext);
  },
});
