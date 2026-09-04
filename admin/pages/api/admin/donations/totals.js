import { sendError, sendSuccess } from "@/utils/apiResponse";
import { createAdminCrudHandler } from "@/utils/crudHandler";
import { getCampaignTotals } from "@/services/server/donationsService";

export default createAdminCrudHandler("/api/admin/donations/totals", {
  GET: {
    permission: "donations.read",
    handler: async (req, res, context) => {
      const campaignId = typeof req.query.campaignId === "string" ? req.query.campaignId : undefined;
      const result = await getCampaignTotals(null, { campaignId });
      if (!result.success) return sendError(res, result.error.code, result.error.message, { status: 400, requestId: context.requestId });
      return sendSuccess(res, result.data, { requestId: context.requestId });
    },
  },
});
