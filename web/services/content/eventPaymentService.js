import { randomUUID } from "crypto";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { parseWithSchema } from "@/validators/common";
import { initializeEventPaymentSchema, verifyEventPaymentSchema } from "@/validators/eventPayment";
import { paystackRequest } from "./paystackClient";
import { serviceFailure, serviceSuccess } from "./serviceUtils";

function getTicketTier(event, tierId) {
  const tiers = Array.isArray(event.body?.ticketTiers) ? event.body.ticketTiers : [];
  return tiers.find((tier) => String(tier?.id) === tierId) || null;
}

export async function initializeEventPayment(input, { client } = {}) {
  const validation = parseWithSchema(initializeEventPaymentSchema, input);
  if (!validation.success) return serviceFailure(validation.error);
  const values = validation.data;
  let supabase;
  try {
    supabase = client || createSupabaseServiceRoleClient();
  } catch {
    return serviceFailure({ code: "PAYMENT_CONFIGURATION_ERROR", message: "The payment database is not configured on the server." });
  }
  const { data: event, error } = await supabase.from("events").select("id,slug,title,body,status").eq("slug", values.eventSlug).eq("status", "published").maybeSingle();
  if (error || !event) return serviceFailure({ code: "NOT_FOUND", message: "This event is not available for ticket purchase." });
  const tier = getTicketTier(event, values.tierId);
  if (!tier) return serviceFailure({ code: "NOT_FOUND", message: "This ticket tier is no longer available." });
  const available = tier.available === null || tier.available === undefined || tier.available === "" ? null : Number(tier.available);
  if (available !== null && (available < values.quantity || available <= 0)) return serviceFailure({ code: "CONFLICT", message: "There are not enough tickets available." });
  const priceNaira = Number(tier.price);
  if (!Number.isFinite(priceNaira) || priceNaira <= 0) return serviceFailure({ code: "VALIDATION_ERROR", message: "This ticket price is invalid." });
  const serviceFee = Math.min(1000, Math.round(priceNaira * values.quantity * 0.08));
  const amountKobo = Math.round((priceNaira * values.quantity + serviceFee) * 100);
  const reference = `RH-TKT-${randomUUID().replaceAll("-", "").slice(0, 20).toUpperCase()}`;
  const { error: insertError } = await supabase.from("event_ticket_orders").insert({ reference, event_id: event.id, tier_id: values.tierId, tier_name: String(tier.name || "Ticket"), quantity: values.quantity, amount_kobo: amountKobo, customer: values.customer });
  if (insertError) return serviceFailure({ code: "PERSIST_FAILED", message: "Unable to create the ticket order." });
  const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/payment/paystack/callback`;
  const result = await paystackRequest("/transaction/initialize", { method: "POST", body: JSON.stringify({ amount: amountKobo, email: values.customer.email, reference, callback_url: callbackUrl, metadata: { eventId: event.id, eventSlug: event.slug, tierId: values.tierId, quantity: values.quantity } }) });
  if (!result.success) {
    await supabase.from("event_ticket_orders").update({ status: "failed" }).eq("reference", reference);
    return serviceFailure({ code: result.code || "PAYMENT_PROVIDER_ERROR", message: result.error || "Unable to connect to Paystack. Please try again." });
  }
  return serviceSuccess({ authorizationUrl: result.data.authorization_url, reference, amountKobo }, "Continue to Paystack to complete payment.");
}

export async function verifyEventPayment(input, { client } = {}) {
  const validation = parseWithSchema(verifyEventPaymentSchema, input);
  if (!validation.success) return serviceFailure(validation.error);
  const result = await paystackRequest(`/transaction/verify/${encodeURIComponent(validation.data.reference)}`);
  if (!result.success || result.data.status !== "success" || result.data.reference !== validation.data.reference) return serviceFailure({ code: "PAYMENT_NOT_VERIFIED", message: "Paystack could not verify this payment." });
  const supabase = client || createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("complete_event_ticket_payment", { p_reference: validation.data.reference, p_paystack_transaction_id: String(result.data.id) });
  if (error || !data) return serviceFailure({ code: "PAYMENT_COMPLETION_FAILED", message: "Payment was received but ticket confirmation is pending. Please contact support." });

  // Sync event totalSpots, spotsRemaining, and ticketsSold in body to preserve the previous total and deduct remaining
  try {
    const { data: eventRow } = await supabase.from("events").select("id, body").eq("id", data.event_id).maybeSingle();
    if (eventRow) {
      const currentBody = eventRow.body || {};
      const tiers = Array.isArray(currentBody.ticketTiers) ? currentBody.ticketTiers : [];
      const remainingSum = tiers.reduce((acc, t) => acc + Math.max(0, Math.floor(Number(t.available) || 0)), 0);

      const { data: allPaidOrders } = await supabase
        .from("event_ticket_orders")
        .select("quantity")
        .eq("event_id", data.event_id)
        .eq("status", "paid");

      const totalSold = (allPaidOrders || []).reduce((acc, o) => acc + (Number(o.quantity) || 0), 0);
      const previousTotal = Number(currentBody.totalSpots) || 0;
      const totalCapacity = Math.max(previousTotal, remainingSum + totalSold);

      const nextBody = {
        ...currentBody,
        totalSpots: totalCapacity,
        spotsRemaining: remainingSum,
        ticketsSold: totalSold,
      };

      await supabase.from("events").update({ body: nextBody, updated_at: new Date().toISOString() }).eq("id", data.event_id);
    }
  } catch {
    // Non-fatal if body sync fails; payment was already verified and inventory decremented
  }

  const { data: event } = await supabase.from("events").select("title,slug").eq("id", data.event_id).maybeSingle();
  return serviceSuccess({ reference: data.reference, eventTitle: event?.title || "RoyzHouz event", eventSlug: event?.slug || null, tierName: data.tier_name, quantity: data.quantity, amountKobo: data.amount_kobo, customer: data.customer }, "Payment confirmed and tickets reserved.");
}
