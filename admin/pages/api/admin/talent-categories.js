import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import {
  deleteTalentCategory,
  listTalentCategories,
  reorderTalentCategories,
  saveTalentCategory,
} from "@/services/server/talentsService";
import { talentCategorySchema } from "@/validators/talents";

export default createAdminCrudHandler("/api/admin/talent-categories", {
  GET: {
    permission: "talents.create",
    handler: async (_req, res) => {
      const result = await listTalentCategories(null);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "talents.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: talentCategorySchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await saveTalentCategory(null, { actorUserId: context.actor.user.id, category: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PATCH: {
    permission: "talents.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: z.object({
          ids: z
            .array(z.string().uuid())
            .min(1)
            .max(500)
            .refine((ids) => new Set(ids).size === ids.length, "Category ids must be unique."),
        }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await reorderTalentCategories(null, {
        actorUserId: context.actor.user.id,
        ids: input.ids,
      });
      if (!result.success) {
        return sendError(res, result.error.code, result.error.message, {
          status: 400,
          requestId: context.requestId,
        });
      }
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "talents.delete",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: z.object({ id: z.string().uuid() }),
        input: req.query,
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;

      const result = await deleteTalentCategory(null, {
        actorUserId: context.actor.user.id,
        id: input.id,
      });
      if (!result.success) {
        const status = result.error.code === "CATEGORY_NOT_FOUND" ? 404 : result.error.code === "CATEGORY_IN_USE" ? 409 : 400;
        return sendError(res, result.error.code, result.error.message, { status, requestId: context.requestId });
      }
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  PUT: {
    permission: "talents.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: talentCategorySchema.extend({ id: z.string().uuid() }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await saveTalentCategory(null, { actorUserId: context.actor.user.id, category: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
