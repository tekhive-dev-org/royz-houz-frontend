import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import {
  archiveTalent,
  listTalents,
  reorderFeaturedTalents,
  saveTalent,
} from "@/services/server/talentsService";
import { reorderTalentsSchema, talentListQuerySchema, talentSchema } from "@/validators/talents";

const READ = "talents.create";
const WRITE = "talents.update";

function mutationErrorStatus(code) {
  return code === "SLUG_CONFLICT" ? 409 : 400;
}

export default createAdminCrudHandler("/api/admin/talents", {
  GET: {
    permission: READ,
    handler: async (req, res) => {
      const parsed = talentListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }
      const result = await listTalents(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: WRITE,
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: talentSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await saveTalent(null, { actorUserId: context.actor.user.id, talent: input });
      if (!result.success) {
        return sendError(res, result.error.code, result.error.message, {
          status: mutationErrorStatus(result.error.code),
          requestId: context.requestId,
        });
      }
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: WRITE,
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: talentSchema.extend({ id: z.string().uuid() }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await saveTalent(null, { actorUserId: context.actor.user.id, talent: input });
      if (!result.success) {
        return sendError(res, result.error.code, result.error.message, {
          status: mutationErrorStatus(result.error.code),
          requestId: context.requestId,
        });
      }
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  PATCH: {
    permission: WRITE,
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: reorderTalentsSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await reorderFeaturedTalents(null, { ids: input.ids, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "talents.delete",
    handler: async (req, res, context) => {
      const id = req.query.id;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A talent id is required.", { status: 400, requestId: context.requestId });
      }
      // Archive is the default; hard deletion is intentionally not exposed.
      const result = await archiveTalent(null, { id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
