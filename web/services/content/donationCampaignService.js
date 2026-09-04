import { listPublicRecords } from "@/repositories/publicContentRepository";
import { toDonationCampaign } from "@/adapters/donationAdapter";
import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

export async function listDonationCampaigns({ client } = {}) {
  const result = await listPublicRecords(getContentClient(client), {
    source: "donation_campaigns",
    order: { column: "sort_order" },
  });
  if (!result.success) return serviceFailure(result.error);
  return serviceSuccess(result.data.map(toDonationCampaign), "Donation campaigns loaded successfully");
}
