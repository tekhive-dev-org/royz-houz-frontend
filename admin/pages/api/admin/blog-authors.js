import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import {
  deleteBlogAuthor,
  listBlogAuthors,
  saveBlogAuthor,
} from "@/services/server/blogService";
import { blogAuthorSchema } from "@/validators/blog";

export default createAdminCrudHandler("/api/admin/blog-authors", {
  GET: {
    permission: "blog.create",
    handler: async (_req, res) => {
      const result = await listBlogAuthors(null);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "blog.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: blogAuthorSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await saveBlogAuthor(null, { actorUserId: context.actor.user.id, author: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "blog.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: blogAuthorSchema.extend({ id: z.string().uuid() }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await saveBlogAuthor(null, { actorUserId: context.actor.user.id, author: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "blog.delete",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: z.object({ id: z.string().uuid() }),
        input: req.query,
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await deleteBlogAuthor(null, {
        actorUserId: context.actor.user.id,
        id: input.id,
      });
      if (!result.success) {
        const status = result.error.code === "AUTHOR_NOT_FOUND" ? 404 : result.error.code === "AUTHOR_IN_USE" ? 409 : 400;
        return sendError(res, result.error.code, result.error.message, { status, requestId: context.requestId });
      }
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
