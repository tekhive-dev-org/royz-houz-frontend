/**
 * Centralized Date & Time Formatting Utilities
 * Standardizes all date presentation across cards, articles, events, and reviews
 * to the executive format: "January 1, 2026"
 */

export const DEFAULT_EVENT_TIMEZONE = "Africa/Lagos";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Format any date value into "January 1, 2026"
 * Supports ISO strings, Date objects, timestamps, or date string representations.
 *
 * @param {string | number | Date | null | undefined} dateInput
 * @returns {string} Formatted date (e.g. "January 1, 2026")
 */
export function formatDate(dateInput, timeZone = DEFAULT_EVENT_TIMEZONE) {
  if (!dateInput) return "";

  if (typeof dateInput === "string") {
    const trimmed = dateInput.trim();
    if (!trimmed) return "";

    // Match "Month D, YYYY" or "Month D YYYY" (e.g. "Feb 26 2026", "April 10, 2026")
    const m1 = trimmed.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
    if (m1) {
      const monthStr = m1[1].toLowerCase();
      const matchedIdx = MONTH_NAMES.findIndex((m) =>
        m.toLowerCase().startsWith(monthStr.slice(0, 3))
      );
      const month = matchedIdx !== -1 ? MONTH_NAMES[matchedIdx] : m1[1];
      return `${month} ${parseInt(m1[2], 10)}, ${m1[3]}`;
    }

    // Match "D Mon YYYY" or "DD Month YYYY" (e.g. "12 Oct 2024", "08 Oct 2024")
    const m2 = trimmed.match(/^(\d{1,2})\s+([A-Za-z]+),?\s+(\d{4})$/);
    if (m2) {
      const monthStr = m2[2].toLowerCase();
      const matchedIdx = MONTH_NAMES.findIndex((m) =>
        m.toLowerCase().startsWith(monthStr.slice(0, 3))
      );
      const month = matchedIdx !== -1 ? MONTH_NAMES[matchedIdx] : m2[2];
      return `${month} ${parseInt(m2[1], 10)}, ${m2[3]}`;
    }

    // Date-only values have no timezone and should remain unchanged. ISO
    // timestamps are formatted in the event timezone below.
    const dateOnly = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      const month = MONTH_NAMES[parseInt(dateOnly[2], 10) - 1] || dateOnly[2];
      return `${month} ${parseInt(dateOnly[3], 10)}, ${dateOnly[1]}`;
    }
  }

  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return typeof dateInput === "string" ? dateInput : "";
  }

  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      month: "long",
      day: "numeric",
      year: "numeric",
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${values.month} ${values.day}, ${values.year}`;
  } catch {
    return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
  }
}

/**
 * Format time into "3:00 PM"
 *
 * @param {string | number | Date | null | undefined} dateInput
 * @returns {string} Formatted time
 */
export function formatTime(dateInput, timeZone = DEFAULT_EVENT_TIMEZONE) {
  if (!dateInput) return "";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "";

  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch {
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : String(minutes);
    return `${hours}:${minutesStr} ${ampm}`;
  }
}

/**
 * Format date & time into "January 1, 2026 · 3:00 PM"
 *
 * @param {string | number | Date | null | undefined} dateInput
 * @returns {string} Formatted date & time
 */
export function formatDateTime(dateInput) {
  if (!dateInput) return "";
  const dateStr = formatDate(dateInput);
  const timeStr = formatTime(dateInput);
  return timeStr ? `${dateStr} · ${timeStr}` : dateStr;
}

export default formatDate;
