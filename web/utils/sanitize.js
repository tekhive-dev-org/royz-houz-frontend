const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAGS = /<\/?[a-z][^>]*>/gi;

/**
 * Normalizes plain user-submitted text before Zod and database validation.
 * Rich HTML is not accepted by public submission endpoints.
 */
export function sanitizePlainText(value) {
  if (typeof value !== "string") return value;
  return value.replace(CONTROL_CHARACTERS, "").replace(HTML_TAGS, "").trim();
}

export function sanitizeSubmissionInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (typeof value === "string") return [key, sanitizePlainText(value)];
      if (Array.isArray(value)) {
        return [
          key,
          value.map((item) =>
            item && typeof item === "object" ? sanitizeSubmissionInput(item) : sanitizePlainText(item)
          ),
        ];
      }
      if (value && typeof value === "object") return [key, sanitizeSubmissionInput(value)];
      return [key, value];
    })
  );
}
