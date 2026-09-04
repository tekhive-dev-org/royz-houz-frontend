import { z } from "zod";
import { safeUrlSchema } from "@/utils/safeUrl";
import { optionalDateTimeSchema } from "./common";

export const campaignSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(160)
    .optional(),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(1000).optional(),
  description: z.string().trim().max(5000).optional(),
  targetAmount: z.coerce.number().positive().max(1_000_000_000).optional(),
  currency: z.string().regex(/^[A-Z]{3}$/).default("NGN"),
  image: safeUrlSchema.optional(),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).default(0),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  scheduledAt: optionalDateTimeSchema,
});

export const campaignListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
});

export const recordListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  status: z.enum(["pending", "approved", "rejected", "spam", "hidden"]).optional(),
  campaignId: z.string().uuid().optional(),
});

export const recordNoteSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().trim().max(5000).nullable().optional(),
});
