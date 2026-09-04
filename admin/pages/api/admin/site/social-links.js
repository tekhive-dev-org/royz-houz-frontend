import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { deleteRow, listRows, reorderRows, upsertContentRow } from "@/services/server/contentService";
import { reorderSchema, socialLinkSchema } from "@/validators/site";

export default createAdminCrudHandler("/api/admin/site/social-links", {
  GET: {
    permission: "settings.read",
    handler: async (req, res) => {
      const { placement } = req.query;
      const result = await listRows(null, "social_links", {
        order: { column: "sort_order" },
        filters: placement ? [{ column: "placement", value: placement }] : [],
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: socialLinkSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const { data: maxRows } = await listRows(null, "social_links", {
        order: { column: "sort_order", ascending: false },
        filters: [{ column: "placement", value: input.placement }],
        limit: 1,
      });
      const sortOrder = maxRows && maxRows.length > 0 ? (maxRows[0].sort_order + 1) : 0;

      const result = await upsertContentRow(null, {
        table: "social_links",
        actorUserId: context.actor.user.id,
        row: { platform: input.platform, url: input.url, placement: input.placement, label: input.label || null, sort_order: sortOrder },
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
        schema: socialLinkSchema.extend({ id: z.string().uuid() }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await upsertContentRow(null, {
        table: "social_links",
        actorUserId: context.actor.user.id,
        row: { id: input.id, platform: input.platform, url: input.url, placement: input.placement, label: input.label || null },
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
        table: "social_links",
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
      const result = await deleteRow(null, { table: "social_links", id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
