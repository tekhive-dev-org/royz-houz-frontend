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

export function parseWithSchema(schema, input) {
  const result = schema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "Invalid request data.",
      details: result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    },
  };
}
