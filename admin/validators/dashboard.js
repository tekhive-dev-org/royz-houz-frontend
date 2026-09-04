import { z } from "zod";

const isoDateSchema = z.string().datetime({ offset: true });

export const dashboardQuerySchema = z
  .object({
    days: z.coerce.number().int().min(1).max(365).default(30),
    from: isoDateSchema.optional(),
    to: isoDateSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.from && value.to && value.from > value.to) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["from"],
        message: "Start date must be on or before the end date.",
      });
    }
  });
