import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { deleteRow, listRows, reorderRows, upsertContentRow } from "@/services/server/contentService";
import { footerSectionSchema, reorderSchema } from "@/validators/site";

export default createAdminCrudHandler("/api/admin/site/footer-sections", {
  GET: {
    permission: "settings.read",
    handler: async (_req, res) => {
      const result = await listRows(null, "footer_sections", { order: { column: "sort_order" } });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: footerSectionSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const { data: maxRows } = await listRows(null, "footer_sections", {
        order: { column: "sort_order", ascending: false },
        limit: 1,
      });
      const sortOrder = maxRows && maxRows.length > 0 ? (maxRows[0].sort_order + 1) : 0;

      const result = await upsertContentRow(null, {
        table: "footer_sections",
        actorUserId: context.actor.user.id,
        row: { slug: input.slug, title: input.title, summary: input.summary || null, content: input.content || {}, sort_order: sortOrder },
        status: input.status,
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: footerSectionSchema.extend({ id: z.string().uuid() }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await upsertContentRow(null, {
        table: "footer_sections",
        actorUserId: context.actor.user.id,
        row: { id: input.id, slug: input.slug, title: input.title, summary: input.summary || null, content: input.content || {} },
        status: input.status,
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  PATCH: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: reorderSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await reorderRows(null, {
        table: "footer_sections",
        ids: input.ids,
        actorUserId: context.actor.user.id,
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const id = req.query.id;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A record id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await deleteRow(null, { table: "footer_sections", id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
