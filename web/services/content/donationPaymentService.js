import { randomUUID } from "crypto";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { parseWithSchema } from "@/validators/common";
import {
  initializeDonationPaymentSchema,
  verifyDonationPaymentSchema,
} from "@/validators/donationPayment";
import { paystackRequest } from "./paystackClient";
import { serviceFailure, serviceSuccess } from "./serviceUtils";

function getCallbackUrl() {
  if (process.env.PAYSTACK_DONATION_CALLBACK_URL) {
    return process.env.PAYSTACK_DONATION_CALLBACK_URL;
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${siteUrl}/payment/paystack/callback`;
}

export async function initializeDonationPayment(input, { client } = {}) {
  const validation = parseWithSchema(initializeDonationPaymentSchema, input);
  if (!validation.success) {
    return serviceFailure(validation.error);
  }

  const values = validation.data;
  let supabase;
  try {
    supabase = client || createSupabaseServiceRoleClient();
  } catch {
    return serviceFailure({
      code: "PAYMENT_CONFIGURATION_ERROR",
      message: "The payment database is not configured on the server.",
    });
  }

  // Look up the targeted donation campaign
  const { data: campaign, error: campaignError } = await supabase
    .from("donation_campaigns")
    .select("id, slug, title, status")
    .eq("slug", values.campaignSlug)
    .eq("status", "published")
    .maybeSingle();

  if (campaignError || !campaign) {
    return serviceFailure({
      code: "NOT_FOUND",
      message: "The requested donation campaign is not currently active.",
    });
  }

  const amountKobo = Math.round(Number(values.amount) * 100);
  if (!Number.isFinite(amountKobo) || amountKobo < 10000) {
    return serviceFailure({
      code: "VALIDATION_ERROR",
      message: "Minimum donation amount is ₦100.",
    });
  }

  const reference = `RH-DON-${randomUUID().replaceAll("-", "").slice(0, 16).toUpperCase()}`;

  // Insert initial pending donation record
  const { data: insertedRecord, error: insertError } = await supabase
    .from("donation_records")
    .insert({
      donation_campaign_id: campaign.id,
      reference,
      donor_name: values.donorName,
      donor_email: values.donorEmail,
      donor_phone: values.donorPhone || null,
      amount: values.amount,
      currency: values.currency || "NGN",
      frequency: values.frequency || "one-time",
      status: "pending",
      internal_notes: "Paystack checkout initiated",
    })
    .select("id")
    .single();

  if (insertError) {
    return serviceFailure({
      code: "PERSIST_FAILED",
      message: "Unable to create your donation record. Please try again.",
    });
  }

  const callbackUrl = getCallbackUrl();

  const paystackResult = await paystackRequest("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      amount: amountKobo,
      email: values.donorEmail,
      reference,
      callback_url: callbackUrl,
      metadata: {
        type: "donation",
        donationRecordId: insertedRecord?.id,
        campaignSlug: campaign.slug,
        campaignTitle: campaign.title,
        campaignId: campaign.id,
        donorName: values.donorName,
        donorEmail: values.donorEmail,
        donorPhone: values.donorPhone || "",
        frequency: values.frequency,
      },
    }),
  });

  if (!paystackResult.success) {
    await supabase
      .from("donation_records")
      .update({
        internal_notes: `Paystack initialization failed: ${paystackResult.error || "Unknown error"}`,
      })
      .eq("reference", reference);

    return serviceFailure({
      code: paystackResult.code || "PAYMENT_PROVIDER_ERROR",
      message: paystackResult.error || "Unable to connect to Paystack. Please try again.",
    });
  }

  return serviceSuccess(
    {
      authorizationUrl: paystackResult.data.authorization_url,
      reference,
      amount: values.amount,
      campaignTitle: campaign.title,
    },
    "Continue to Paystack to complete your donation."
  );
}

export async function verifyDonationPayment(input, { client } = {}) {
  const validation = parseWithSchema(verifyDonationPaymentSchema, input);
  if (!validation.success) {
    return serviceFailure(validation.error);
  }

  const { reference } = validation.data;

  // 1. Verify with Paystack API
  const paystackResult = await paystackRequest(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );

  if (
    !paystackResult.success ||
    paystackResult.data?.status !== "success" ||
    paystackResult.data?.reference !== reference
  ) {
    return serviceFailure({
      code: "PAYMENT_NOT_VERIFIED",
      message: "Paystack could not verify this donation payment.",
    });
  }

  let supabase;
  try {
    supabase = client || createSupabaseServiceRoleClient();
  } catch {
    return serviceFailure({
      code: "PAYMENT_CONFIGURATION_ERROR",
      message: "The payment database is not configured on the server.",
    });
  }

  // 2. Locate existing donation record
  const { data: record, error: findError } = await supabase
    .from("donation_records")
    .select("*, donation_campaigns(id, title, slug)")
    .eq("reference", reference)
    .maybeSingle();

  if (findError || !record) {
    return serviceFailure({
      code: "NOT_FOUND",
      message: "Donation record not found for this reference.",
    });
  }

  // Idempotency: if already approved, return record
  if (record.status === "approved") {
    return serviceSuccess(
      {
        id: record.id,
        reference: record.reference,
        amount: Number(record.amount),
        currency: record.currency,
        frequency: record.frequency,
        donorName: record.donor_name,
        donorEmail: record.donor_email,
        donorPhone: record.donor_phone,
        campaignTitle: record.donation_campaigns?.title || "Royz House Foundation",
        campaignSlug: record.donation_campaigns?.slug || "",
        paidAt: record.approved_at,
        status: record.status,
      },
      "Donation payment already confirmed."
    );
  }

  // 3. Mark approved in donation_records
  const approvedAt = new Date().toISOString();
  const txId = String(paystackResult.data?.id || "");
  const channel = String(paystackResult.data?.channel || "card");

  const { data: updatedRecord, error: updateError } = await supabase
    .from("donation_records")
    .update({
      status: "approved",
      approved_at: approvedAt,
      internal_notes: `Paystack payment verified. Transaction ID: ${txId} (Channel: ${channel})`,
    })
    .eq("id", record.id)
    .select("*, donation_campaigns(id, title, slug)")
    .single();

  if (updateError || !updatedRecord) {
    return serviceFailure({
      code: "PAYMENT_COMPLETION_FAILED",
      message: "Payment was received by Paystack, but database confirmation is pending.",
    });
  }

  return serviceSuccess(
    {
      id: updatedRecord.id,
      reference: updatedRecord.reference,
      amount: Number(updatedRecord.amount),
      currency: updatedRecord.currency,
      frequency: updatedRecord.frequency,
      donorName: updatedRecord.donor_name,
      donorEmail: updatedRecord.donor_email,
      donorPhone: updatedRecord.donor_phone,
      campaignTitle: updatedRecord.donation_campaigns?.title || "Royz House Foundation",
      campaignSlug: updatedRecord.donation_campaigns?.slug || "",
      paidAt: updatedRecord.approved_at,
      status: updatedRecord.status,
    },
    "Thank you for your generosity! Your donation has been verified."
  );
}
