import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { listBlogAuthors, listBlogCategories, saveBlogAuthor, saveBlogCategory } from "@/services/server/blogService";
import { blogAuthorSchema, blogCategorySchema } from "@/validators/blog";

export default createAdminCrudHandler("/api/admin/blog/taxonomy", {
  GET: {
    permission: "blog.create",
    handler: async (req, res) => {
      const { type } = req.query;
      if (type === "authors") {
        const result = await listBlogAuthors(null);
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
        return sendSuccess(res, result.data);
      }
      const result = await listBlogCategories(null);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "blog.update",
    handler: async (req, res, context) => {
      const body = getJsonBody(req);
      if (body.type === "author") {
        const input = validateRequest({ res, schema: blogAuthorSchema, input: body, requestId: context.requestId, logContext: context });
        if (!input) return null;
        const result = await saveBlogAuthor(null, { actorUserId: context.actor.user.id, author: input });
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
        return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
      }

      const input = validateRequest({ res, schema: blogCategorySchema, input: body, requestId: context.requestId, logContext: context });
      if (!input) return null;
      const result = await saveBlogCategory(null, { actorUserId: context.actor.user.id, category: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "blog.update",
    handler: async (req, res, context) => {
      const body = getJsonBody(req);
      if (body.type === "author") {
        const input = validateRequest({ res, schema: blogAuthorSchema.extend({ id: z.string().uuid() }), input: body, requestId: context.requestId, logContext: context });
        if (!input) return null;
        const result = await saveBlogAuthor(null, { actorUserId: context.actor.user.id, author: input });
        if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
        return sendSuccess(res, result.data, { requestId: context.requestId });
      }

      const input = validateRequest({ res, schema: blogCategorySchema.extend({ id: z.string().uuid() }), input: body, requestId: context.requestId, logContext: context });
      if (!input) return null;
      const result = await saveBlogCategory(null, { actorUserId: context.actor.user.id, category: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
