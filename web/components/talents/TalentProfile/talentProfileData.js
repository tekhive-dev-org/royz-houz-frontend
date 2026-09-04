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
  return talent?.bookingPrice || talent?.startingRate || "";
}
