import { z } from "zod";
import { getJsonBody, validateRequest } from "@/utils/apiRequest";
import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { archiveCampaign, listCampaigns, saveCampaign } from "@/services/server/donationsService";
import { campaignListQuerySchema, campaignSchema } from "@/validators/donations";

export default createAdminCrudHandler("/api/admin/donations/campaigns", {
  GET: {
    permission: "donations.read",
    handler: async (req, res) => {
      const parsed = campaignListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        return sendError(res, "VALIDATION_ERROR", "Invalid query parameters.", {
          status: 400,
          fields: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])),
        });
      }
      const result = await listCampaigns(null, parsed.data);
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400 });
      return sendSuccess(res, result.data);
    },
  },
  POST: {
    permission: "donations.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: campaignSchema,
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await saveCampaign(null, { actorUserId: context.actor.user.id, campaign: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { status: 201, requestId: context.requestId });
    },
  },
  PUT: {
    permission: "donations.update",
    handler: async (req, res, context) => {
      const input = validateRequest({
        res,
        schema: campaignSchema.extend({ id: z.string().uuid() }),
        input: getJsonBody(req),
        requestId: context.requestId,
        logContext: context,
      });
      if (!input) return null;
      const result = await saveCampaign(null, { actorUserId: context.actor.user.id, campaign: input });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
  DELETE: {
    permission: "donations.update",
    handler: async (req, res, context) => {
      const id = req.query.id;
      if (typeof id !== "string" || !id) {
        return sendError(res, "VALIDATION_ERROR", "A campaign id is required.", { status: 400, requestId: context.requestId });
      }
      const result = await archiveCampaign(null, { id, actorUserId: context.actor.user.id });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
