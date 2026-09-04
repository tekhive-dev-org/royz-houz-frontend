import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only.")
  .max(160);

export const uuidSchema = z.string().uuid("Provide a valid identifier.");

export const searchSchema = z.string().trim().max(160).optional();

export const statusSchema = z.enum(["draft", "scheduled", "published", "archived"]);

export const contentStatusSchema = statusSchema;

export const reviewStatusSchema = z.enum(["pending", "approved", "rejected"]);

export const booleanQuerySchema = z
  .union([z.literal("true"), z.literal("false")])
  .transform((value) => value === "true")
  .optional();

export const optionalDateTimeSchema = z
  .preprocess((val) => {
    if (val === "" || val === null || val === undefined) return undefined;
    if (typeof val === "string") {
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
    return val;
  }, z.string().datetime({ offset: true }).optional())
  .optional();

/** Parses a Zod schema into a normalized result; callers map fields to the API envelope. */
export function parseWithSchema(schema, input) {
  const result = schema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const fieldEntries = result.error.issues.map((issue) => [
    issue.path.join(".") || "form",
    issue.message,
  ]);
  const fields = Object.fromEntries(fieldEntries);
  const detailStr = fieldEntries.map(([k, v]) => `${k}: ${v}`).join(", ");

  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: detailStr ? `Invalid request data (${detailStr})` : "Invalid request data.",
      fields,
    },
  };
}
