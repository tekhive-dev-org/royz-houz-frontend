import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { deleteRow, listRows, reorderRows, upsertContentRow } from "@/services/server/contentService";
import { z } from "zod";
import { navigationItemSchema, reorderSchema } from "@/validators/site";

export default createAdminCrudHandler("/api/admin/site/navigation", {
  GET: {
    permission: "settings.read",
    handler: async (_req, res) => {
      const result = await listRows(null, "navigation_items", { order: { column: "sort_order" } });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "settings.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: navigationItemSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      let sortOrder = input.sortOrder;
      if (sortOrder === undefined || sortOrder === null) {
        const { data: maxRows } = await listRows(null, "navigation_items", {
          order: { column: "sort_order", ascending: false },
          filters: [{ column: "placement", value: input.placement }],
          limit: 1,
        });
        sortOrder = maxRows && maxRows.length > 0 ? (maxRows[0].sort_order + 1) : 0;
      }

      const result = await upsertContentRow(null, {
        table: "navigation_items",
        actorUserId: context.actor.user.id,
        row: {
          label: input.label,
          href: input.href,
          placement: input.placement,
          sort_order: sortOrder,
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
        schema: navigationItemSchema.extend({ id: z.string().uuid() }),
        input: body,
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const updateRow = {
        id: input.id,
        label: input.label,
        href: input.href,
        placement: input.placement,
      };
      if (input.sortOrder !== undefined) {
        updateRow.sort_order = input.sortOrder;
      }

      const result = await upsertContentRow(null, {
        table: "navigation_items",
        actorUserId: context.actor.user.id,
        row: updateRow,
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
        table: "navigation_items",
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
      const result = await deleteRow(null, { table: "navigation_items", id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
