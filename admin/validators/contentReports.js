import { z } from "zod";

export const contentReportStatusSchema = z.enum([
  "new",
  "reviewing",
  "actioned",
  "dismissed",
  "duplicate",
  "archived",
]);

export const contentReportListSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
  search: z.string().trim().regex(/^[\p{L}\p{N}\s.'’_-]+$/u).max(160).optional(),
  status: contentReportStatusSchema.optional(),
  reason: z.enum(["copyright", "inappropriate", "misinformation", "spam", "other"]).optional(),
});

export const contentReportUpdateSchema = z
  .object({
    id: z.string().uuid(),
    status: contentReportStatusSchema.optional(),
    assignedTo: z.string().uuid().nullable().optional(),
    internalNotes: z.string().trim().max(5000).nullable().optional(),
    resolution: z.string().trim().max(2000).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (
      value.status === undefined &&
      value.assignedTo === undefined &&
      value.internalNotes === undefined &&
      value.resolution === undefined
    ) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: "Provide at least one report update." });
    }
    if (["actioned", "dismissed", "duplicate"].includes(value.status) && !value.resolution) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resolution"],
        message: "A resolution is required when closing a report.",
      });
    }
  });
