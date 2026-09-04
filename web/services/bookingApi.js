export function createBookingSubmissionKey() {
  if (typeof crypto === "undefined") return "";
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  if (typeof crypto.getRandomValues !== "function") return "";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

export async function submitBookingRequestRequest(input) {
  const response = await fetch("/api/talents/booking", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error?.message || "Unable to submit the booking request. Please try again.");
  }
  return payload.data;
}
