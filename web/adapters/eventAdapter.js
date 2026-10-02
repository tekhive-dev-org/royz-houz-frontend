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
    ticketLink: body.ticketLink || (row.slug ? `/events/${row.slug}` : "/events"),
    ...getDisplayDateParts(row, body),
  };
}

export function toEventDetails(row) {
  const card = toEventCard(row);
  const body = getBody(row);

  // Tickets purchased from live orders (row.ticketsPurchased) or body.ticketsSold
  const ticketsPurchased = Math.max(
    0,
    Math.floor(Number(row?.ticketsPurchased ?? card?.ticketsPurchased ?? body?.ticketsSold ?? 0) || 0)
  );

  // Check ticket tiers for explicit inventory
  const tiers = Array.isArray(body?.ticketTiers)
    ? body.ticketTiers
    : Array.isArray(card?.ticketTiers)
    ? card.ticketTiers
    : [];

  const tiersWithAvailable = tiers.filter(
    (t) => t && t.available !== null && t.available !== undefined && t.available !== ""
  );

  const tiersAvailableSum = tiersWithAvailable.length > 0
    ? tiersWithAvailable.reduce((acc, t) => acc + Math.max(0, Math.floor(Number(t.available) || 0)), 0)
    : null;

  // Calculate spotsRemaining automatically (comes directly from ticket tiers available inventory)
  let spotsRemaining = null;
  if (tiersAvailableSum !== null) {
    spotsRemaining = tiersAvailableSum;
  } else if (body?.spotsRemaining !== null && body?.spotsRemaining !== undefined && !Number.isNaN(Number(body.spotsRemaining))) {
    spotsRemaining = Math.max(0, Math.floor(Number(body.spotsRemaining)));
  }

  // Determine total capacity: the previous total must remain intact
  let totalSpots = null;
  const derivedTotal = (spotsRemaining !== null ? spotsRemaining : 0) + ticketsPurchased;
  if (body?.totalSpots !== null && body?.totalSpots !== undefined && body?.totalSpots !== "" && !Number.isNaN(Number(body.totalSpots))) {
    totalSpots = Math.max(Math.floor(Number(body.totalSpots)), derivedTotal);
  } else if (derivedTotal > 0) {
    totalSpots = derivedTotal;
  } else if (body?.totalTickets !== null && body?.totalTickets !== undefined && !Number.isNaN(Number(body.totalTickets))) {
    totalSpots = Math.max(0, Math.floor(Number(body.totalTickets)));
  }

  if (spotsRemaining === null && totalSpots !== null) {
    spotsRemaining = Math.max(0, totalSpots - ticketsPurchased);
  }

  // Derive starting price automatically from ticket tiers if available
  const tierPrices = tiers.map((t) => Number(t.price)).filter((p) => Number.isFinite(p) && p >= 0);
  const lowestTierPrice = tierPrices.length > 0 ? Math.min(...tierPrices) : null;
  const startingPrice =
    card.startingPrice ||
    body?.startingPrice ||
    (lowestTierPrice !== null ? (lowestTierPrice === 0 ? "Free" : `₦${lowestTierPrice.toLocaleString()}`) : "");

  return {
    ...card,
    totalSpots,
    spotsRemaining,
    ticketsPurchased,
    startingPrice,
    ticketLink: card.ticketLink || (row?.slug ? `/events/${row.slug}` : "/events"),
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
