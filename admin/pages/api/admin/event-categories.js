import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import {
  deleteEventCategory,
  listEventCategories,
  reorderEventCategories,
  saveEventCategory,
} from "@/services/server/eventsService";
import { eventCategorySchema } from "@/validators/events";

export default createAdminCrudHandler("/api/admin/event-categories", {
  GET: {
    permission: "events.create",
    handler: async (_req, res) => {
      const result = await listEventCategories(null);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  PATCH: {
    permission: "events.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: z.object({ ids: z.array(z.string().uuid()).min(1).max(500).refine((ids) => new Set(ids).size === ids.length, "Category ids must be unique.") }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await reorderEventCategories(null, { actorUserId: context.actor.user.id, ids: input.ids });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "events.delete",
    handler: async (req, res, context) => {
      const input = validateRequest({ res, schema: z.object({ id: z.string().uuid() }), input: req.query, requestId: context.requestId, logContext: context });
      if (!input) return null;
      const result = await deleteEventCategory(null, { actorUserId: context.actor.user.id, id: input.id });
      if (!result.success) {
        const status = result.error.code === "CATEGORY_NOT_FOUND" ? 404 : result.error.code === "CATEGORY_IN_USE" ? 409 : 400;
        return sendError(res, result.error.code, result.error.message, { status, requestId: context.requestId });
      }
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  POST: {
    permission: "events.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: eventCategorySchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await saveEventCategory(null, { actorUserId: context.actor.user.id, category: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "events.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: eventCategorySchema.extend({ id: z.string().uuid() }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await saveEventCategory(null, { actorUserId: context.actor.user.id, category: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
