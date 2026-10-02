import { listPublicRecords } from "@/repositories/publicContentRepository";
import { toDonationCampaign } from "@/adapters/donationAdapter";
import { getContentClient, serviceFailure, serviceSuccess } from "./serviceUtils";

export async function listDonationCampaigns({ client } = {}) {
  const contentClient = getContentClient(client);
  const result = await listPublicRecords(contentClient, {
    source: "donation_campaigns",
    order: { column: "sort_order" },
  });
  if (!result.success) return serviceFailure(result.error);

  // Compute live raised totals from approved donation_records
  const raisedMap = {};
  try {
    let queryClient = client;
    if (!queryClient && typeof window === "undefined") {
      try {
        const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
        queryClient = createSupabaseServiceRoleClient();
      } catch {
        queryClient = contentClient;
      }
    }

    if (queryClient) {
      const { data: records, error } = await queryClient
        .from("donation_records")
        .select("donation_campaign_id, amount")
        .eq("status", "approved");

      if (!error && Array.isArray(records)) {
        for (const row of records) {
          const cId = row.donation_campaign_id;
          if (cId) {
            raisedMap[cId] = (raisedMap[cId] || 0) + Number(row.amount || 0);
          }
        }
      }
    }
  } catch {
    // Fallback if records table cannot be read
  }

  const campaigns = result.data.map((row) => {
    const camp = toDonationCampaign(row);
    const liveRaised = raisedMap[camp.id] ?? camp.raisedAmount ?? 0;
    return {
      ...camp,
      raisedAmount: liveRaised,
    };
  });

  return serviceSuccess(campaigns, "Donation campaigns loaded successfully");
}
