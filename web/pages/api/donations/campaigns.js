import { listDonationCampaigns } from "@/services/content/donationCampaignService";
import { sendServiceResult, withApiHandler } from "@/utils/apiHandler";

export default withApiHandler("/api/donations/campaigns", {
  GET: async (req, res, context) =>
    sendServiceResult(res, await listDonationCampaigns(), {
      ...context,
      route: "/api/donations/campaigns",
      method: req.method,
    }),
});
