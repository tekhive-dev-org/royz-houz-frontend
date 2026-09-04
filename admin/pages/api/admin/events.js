import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import {
  archiveEvent,
  listEvents,
  reorderEvents,
  saveEvent,
} from "@/services/server/eventsService";
import { eventListQuerySchema, eventSchema, reorderEventsSchema } from "@/validators/events";

export default createAdminCrudHandler("/api/admin/events", {
  GET: {
    permission: "events.create",
    handler: async (req, res) => {
      const parsed = eventListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }
      const result = await listEvents(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "events.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: eventSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await saveEvent(null, { actorUserId: context.actor.user.id, event: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "events.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: eventSchema.and(z.object({ id: z.string().uuid() })),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await saveEvent(null, { actorUserId: context.actor.user.id, event: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  PATCH: {
    permission: "events.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: reorderEventsSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await reorderEvents(null, { ids: input.ids, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "events.update",
    handler: async (req, res, context) => {
      const id = req.query.id;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "An event id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await archiveEvent(null, { id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
