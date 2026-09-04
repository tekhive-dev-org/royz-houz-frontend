import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { archiveBlogPost, listBlogPosts, reorderFeaturedBlogPosts, saveBlogPost } from "@/services/server/blogService";
import { blogPostListQuerySchema, blogPostSchema } from "@/validators/blog";

export default createAdminCrudHandler("/api/admin/blog/posts", {
  GET: {
    permission: "blog.create",
    handler: async (req, res) => {
      const parsed = blogPostListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }
      const result = await listBlogPosts(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "blog.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: blogPostSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await saveBlogPost(null, { actorUserId: context.actor.user.id, post: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "blog.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: blogPostSchema.extend({ id: z.string().uuid() }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await saveBlogPost(null, { actorUserId: context.actor.user.id, post: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  PATCH: {
    permission: "blog.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: z.object({
          ids: z
            .array(z.string().uuid())
            .min(1)
            .max(500)
            .refine((ids) => new Set(ids).size === ids.length, "Post ids must be unique."),
        }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await reorderFeaturedBlogPosts(null, { ids: input.ids, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "blog.update",
    handler: async (req, res, context) => {
      const id = req.query.id;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A post id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await archiveBlogPost(null, { id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
