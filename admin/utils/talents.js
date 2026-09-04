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
