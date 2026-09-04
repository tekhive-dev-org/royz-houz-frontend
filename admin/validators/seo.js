import { z } from "zod";
import { safeUrlSchema } from "@/utils/safeUrl";

export const seoRecordSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().max(200).optional(),
  summary: z.string().trim().max(500).optional(),
  canonical: z
    .string()
    .trim()
    .max(2048)
    .optional()
    .refine(
      (value) => !value || value.startsWith("/") || /^https:\/\//.test(value),
      "Canonical must be an internal path or an https URL."
    ),
  ogTitle: z.string().trim().max(200).optional(),
  ogDescription: z.string().trim().max(500).optional(),
  ogImageUrl: safeUrlSchema.optional(),
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  structuredData: z.record(z.unknown()).nullable().optional(),
});

export const seoListQuerySchema = z.object({
  type: z.string().trim().max(80).optional(),
  search: z.string().trim().max(160).optional(),
});

export const seoPreviewSchema = z.object({
  title: z.string().trim().max(200).default(""),
  description: z.string().trim().max(500).default(""),
  canonical: z.string().trim().max(2048).default(""),
});
