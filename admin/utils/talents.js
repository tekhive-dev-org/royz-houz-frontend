export function normalizeTalentSlugPreview(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function formatMediaDuration(seconds) {
  if (seconds === null || seconds === undefined || seconds === "") return "";
  const totalSeconds = Math.max(0, Math.round(Number(seconds)));
  if (!Number.isFinite(totalSeconds)) return "";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return [hours, minutes, remainingSeconds]
      .map((part, index) => (index === 0 ? String(part) : String(part).padStart(2, "0")))
      .join(":");
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export function getTalentPublicPath(talent) {
  const slug = talent?.slug || normalizeTalentSlugPreview(talent?.name);
  return slug ? `/talents/${slug}` : "/talents/[slug]";
}

export function prepareTalentSavePayload(talent) {
  const payload = { ...talent };
  delete payload.category;
  delete payload.categoryKey;
  delete payload.startingRate;
  if (typeof payload.slug === "string" && payload.slug.trim()) {
    payload.slug = normalizeTalentSlugPreview(payload.slug);
  } else {
    delete payload.slug;
  }
  return payload;
}

export const SUPPORTED_BOOKING_CURRENCIES = [
  { value: "₦", label: "₦ (NGN)", symbol: "₦" },
  { value: "$", label: "$ (USD)", symbol: "$" },
  { value: "€", label: "€ (EUR)", symbol: "€" },
  { value: "£", label: "£ (GBP)", symbol: "£" },
  { value: "custom", label: "Custom", symbol: "" },
];

export function parseBookingPrice(val) {
  if (!val || typeof val !== "string") {
    return { currency: "₦", amount: "" };
  }
  const str = val.trim();
  if (!str) {
    return { currency: "₦", amount: "" };
  }
  if (str.startsWith("₦")) {
    return { currency: "₦", amount: str.slice(1).trim() };
  }
  if (str.startsWith("$")) {
    return { currency: "$", amount: str.slice(1).trim() };
  }
  if (str.startsWith("€")) {
    return { currency: "€", amount: str.slice(1).trim() };
  }
  if (str.startsWith("£")) {
    return { currency: "£", amount: str.slice(1).trim() };
  }
  if (/^NGN\s*/i.test(str)) {
    return { currency: "₦", amount: str.replace(/^NGN\s*/i, "").trim() };
  }
  // If it starts with digits, default to Naira (₦)
  if (/^\d/.test(str)) {
    return { currency: "₦", amount: str };
  }
  // Otherwise, custom text (e.g. "Contact for quote")
  return { currency: "custom", amount: str };
}

export function formatBookingPrice(currency, amount) {
  const trimmed = (amount || "").trim();
  if (!trimmed) return "";
  if (currency === "custom" || !currency) {
    return trimmed;
  }
  // Strip any leading currency symbol or NGN prefix the user may have entered/pasted
  const stripped = trimmed.replace(/^[₦$€£¥]\s*|^NGN\s*/i, "");
  if (!stripped) return "";

  // If amount contains numbers (e.g. "250,000" or "500000 / event"), prepend the currency symbol
  if (/\d/.test(stripped)) {
    return `${currency}${stripped}`;
  }

  // Pure text without digits stays as entered
  return stripped;
}

export function formatTalentBookingPrice(price) {
  if (!price) return "";
  const trimmed = String(price).trim();
  if (!trimmed) return "";
  if (/^[₦$€£¥]/.test(trimmed)) return trimmed;
  if (/^NGN\s*/i.test(trimmed)) return trimmed.replace(/^NGN\s*/i, "₦");
  if (/^\d/.test(trimmed)) return `₦${trimmed}`;
  return trimmed;
}

