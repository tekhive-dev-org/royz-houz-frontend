const AVAILABLE_BOOKING_STATUSES = new Set([
  "available",
  "available for booking",
  "open",
]);

export function isTalentAvailableForBooking(talent) {
  if (typeof talent?.isAvailable === "boolean") {
    return talent.isAvailable;
  }

  if (typeof talent?.availableForBooking === "boolean") {
    return talent.availableForBooking;
  }

  if (!talent?.availability) {
    return true;
  }

  return AVAILABLE_BOOKING_STATUSES.has(
    String(talent.availability).trim().toLowerCase(),
  );
}

export function getTalentBookingPrice(talent) {
  const raw = talent?.bookingPrice || talent?.startingRate || "";
  if (!raw) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";

  // If already starts with a recognized currency symbol (₦, $, €, £, ¥)
  if (/^[₦$€£¥]/.test(trimmed)) {
    return trimmed;
  }

  // If prefixed with NGN (e.g. "NGN 250,000" or "NGN250,000")
  if (/^NGN\s*/i.test(trimmed)) {
    return trimmed.replace(/^NGN\s*/i, "₦");
  }

  // If it starts with digits (e.g. "250,000", "250000", "250,000 / event")
  // default currency to Naira (₦) so the symbol automatically displays on the web
  if (/^\d/.test(trimmed)) {
    return `₦${trimmed}`;
  }

  return trimmed;
}

