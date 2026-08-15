import {
  UPCOMING_EVENTS,
  POPULAR_EVENTS,
  PAST_EVENTS,
  DEFAULT_EVENT_DETAILS,
} from "@/constants/events";

/**
 * Combine all events across upcoming, popular, and past datasets.
 */
export function getAllEvents() {
  const map = new Map();
  [...UPCOMING_EVENTS, ...POPULAR_EVENTS, ...PAST_EVENTS].forEach((ev) => {
    if (!map.has(ev.id)) {
      map.set(ev.id, ev);
    }
  });
  return Array.from(map.values());
}

/**
 * Retrieve full event data by slug or ID with fallback to rich default event details.
 * @param {string} slug
 * @returns {object} Full event details object
 */
export function getEventBySlug(slug) {
  if (!slug) return DEFAULT_EVENT_DETAILS;
  const normalized = String(slug).toLowerCase().trim();

  const allEvents = getAllEvents();
  const found = allEvents.find(
    (item) =>
      (item.slug && item.slug.toLowerCase() === normalized) ||
      (item.id && item.id.toLowerCase() === normalized)
  );

  if (!found) {
    return {
      ...DEFAULT_EVENT_DETAILS,
      slug: normalized,
      title: normalized
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" "),
    };
  }

  // Merge found event with default rich details so overview page is always fully populated
  return {
    ...DEFAULT_EVENT_DETAILS,
    ...found,
    title: found.title || DEFAULT_EVENT_DETAILS.title,
    category: found.category || DEFAULT_EVENT_DETAILS.category,
    location: found.location || DEFAULT_EVENT_DETAILS.location,
    image: found.image || DEFAULT_EVENT_DETAILS.image,
  };
}

/**
 * Get all available event slugs for static generation.
 */
export function getAllEventSlugs() {
  return getAllEvents().map((ev) => ev.slug || ev.id);
}
