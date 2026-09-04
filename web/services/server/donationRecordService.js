import { randomUUID } from "node:crypto";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

function createDonationReference() {
  return `RH-DON-${randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

/**
 * Creates a protected donation record. This is not payment processing: no
 * payment-provider ID, charge status, checkout, or transaction reference is
 * accepted from the client or returned in the API response.
 */
export async function createDonationRecord(input, { client } = {}) {
  const supabase = client || createSupabaseServiceRoleClient();
  const { data: campaign, error: campaignError } = await supabase
    .from("donation_campaigns")
    .select("id")
    .eq("slug", input.campaignSlug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (campaignError || !campaign) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "The donation campaign was not found." },
    };
  }

  const { data, error } = await supabase
    .from("donation_records")
    .insert({
      donation_campaign_id: campaign.id,
      reference: createDonationReference(),
      donor_name: input.donorName,
      donor_email: input.donorEmail,
      donor_phone: input.donorPhone || null,
      amount: input.amount,
      currency: input.currency,
      frequency: input.frequency,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    return {
      success: false,
      error: {
        code: "SUBMISSION_FAILED",
        message: "Unable to record your donation request. Please try again.",
      },
    };
  }

  return {
    success: true,
    data: { id: data.id },
    message: "Your donation request has been recorded.",
  };
}
