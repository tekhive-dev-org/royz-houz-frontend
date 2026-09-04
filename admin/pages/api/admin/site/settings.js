import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { deleteRow, listRows, upsertContentRow } from "@/services/server/contentService";
import { siteSettingSchema } from "@/validators/site";

export default createAdminCrudHandler("/api/admin/site/settings", {
  GET: {
    permission: "settings.read",
    handler: async (_req, res) => {
      const result = await listRows(null, "site_settings", { order: { column: "sort_order" } });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: siteSettingSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await upsertContentRow(null, {
        table: "site_settings",
        actorUserId: context.actor.user.id,
        row: {
          slug: input.slug,
          title: input.title,
          summary: input.summary || null,
          content: input.content || {},
          sort_order: input.sortOrder ?? 0,
        },
        status: input.status,
      });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const body = getJsonBody(req);
      const input = validateRequest({
        res,
        schema: siteSettingSchema.extend({ id: z.string().uuid() }),
        input: body,
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await upsertContentRow(null, {
        table: "site_settings",
        actorUserId: context.actor.user.id,
        row: {
          id: input.id,
          slug: input.slug,
          title: input.title,
          summary: input.summary || null,
          content: input.content || {},
          sort_order: input.sortOrder ?? 0,
        },
        status: input.status,
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
      const result = await deleteRow(null, { table: "site_settings", id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
