import { getBody } from "./contentAdapter.js";
import { DEFAULT_EVENT_TIMEZONE, formatDate, formatTime } from "../utils/dateFormatter";

const EVENT_IMAGE_FALLBACK = "/assets/img/events/events-hero-bg.png";

function hasEventEnded(row, body) {
  const endTimestamp = row.ends_at || body.endsAt || row.starts_at;
  if (!endTimestamp) return false;
  const endDate = new Date(endTimestamp).getTime();
  return Number.isFinite(endDate) && endDate <= Date.now();
}

function getDisplayDateParts(row, body) {
  const date = row.starts_at ? new Date(row.starts_at) : null;
  const timeZone = row.timezone || DEFAULT_EVENT_TIMEZONE;
  const fallbackMonth = body.month || "";
  const dateParts = date && !Number.isNaN(date.getTime())
    ? Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "2-digit", year: "numeric" }).formatToParts(date).map((part) => [part.type, part.value]))
    : null;
  const formattedDate = formatDate(row.starts_at || body.dateString || body.date, timeZone);
  return {
    day: body.day || dateParts?.day || "",
    month: fallbackMonth || dateParts?.month || "",
    year: body.year || dateParts?.year || "",
    dateString: formattedDate || body.dateString || "",
  };
}

export function toEventCard(row) {
  const body = getBody(row);
  return {
    ...body,
    id: body.id || row.id,
    slug: row.slug,
    title: row.title,
    starts_at: row.starts_at || null,
    ends_at: row.ends_at || null,
    timezone: row.timezone || DEFAULT_EVENT_TIMEZONE,
    description: body.description || row.summary || "",
    location: body.location || row.venue_address || row.venue_name || "",
    image: body.image || EVENT_IMAGE_FALLBACK,
    isPopular: Boolean(body.isPopular),
    isPast: hasEventEnded(row, body),
    ...getDisplayDateParts(row, body),
  };
}

export function toEventDetails(row) {
  const card = toEventCard(row);
  return {
    ...card,
    heroImage: card.heroImage || card.image,
    venue: card.venue || row.venue_address || row.venue_name || card.location,
    time: card.time || formatTime(row.starts_at) || "",
    dateFormatted: formatDate(row.starts_at || card.dateString || card.date),
    countdownTarget: card.countdownTarget || row.starts_at || null,
  };
}

export function toEventCategory(row) {
  return row.title;
}
