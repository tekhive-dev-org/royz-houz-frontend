import { z } from "zod";

const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];

/**
 * Accepts only same-origin relative paths and safe external schemes. Returns a
 * normalized URL string, or null when the value is unsafe.
 */
export function validateSafeUrl(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();
  if (DANGEROUS_PROTOCOLS.some((protocol) => lower.startsWith(protocol))) return null;

  // Internal application paths.
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;

  // Safe absolute URLs and mail/telephone links.
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return trimmed;
    if (parsed.protocol === "mailto:" || parsed.protocol === "tel:") return trimmed;
    return null;
  } catch {
    return null;
  }
}

export const safeUrlSchema = z
  .string()
  .trim()
  .max(2048)
  .transform((value, context) => {
    if (!value) return undefined;
    const safe = validateSafeUrl(value);
    if (!safe) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid internal or external link.",
      });
      return z.NEVER;
    }
    return safe;
  });

export const requiredSafeUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .transform((value, context) => {
    const safe = validateSafeUrl(value);
    if (!safe) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid internal or external link.",
      });
      return z.NEVER;
    }
    return safe;
  });

export const internalOrExternalUrlSchema = safeUrlSchema;

