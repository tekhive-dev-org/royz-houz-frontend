import { z } from "zod";
import { slugSchema } from "./common";

export const contentReportReasonSchema = z.enum([
  "copyright",
  "inappropriate",
  "misinformation",
  "spam",
  "other",
]);

export const contentReportSchema = z
  .object({
    submissionKey: z.string().uuid(),
    targetType: z.enum(["talent_media", "media_asset"]),
    targetId: z.string().uuid(),
    talentId: z.string().uuid().nullable().optional(),
    targetKey: slugSchema,
    targetTitle: z.string().trim().min(1).max(200),
    reason: contentReportReasonSchema,
    details: z.string().trim().max(2000).nullable().optional(),
    reporterEmail: z.string().trim().toLowerCase().email().max(254).nullable().optional(),
  })
  .superRefine((value, context) => {
    if (value.reason === "other" && !value.details) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["details"],
        message: "Describe the issue you are reporting.",
      });
    }
  });
