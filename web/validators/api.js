import { z } from "zod";
import { paginationSchema, slugSchema } from "./common";

const booleanQuery = z
  .union([z.literal("true"), z.literal("false")])
  .transform((value) => value === "true")
  .optional();

export const catalogQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(160).optional(),
  featured: booleanQuery,
});

export const mediaQuerySchema = catalogQuerySchema.extend({
  type: z.enum(["image", "video", "audio", "document"]).optional(),
});

export const slugParamSchema = z.object({ slug: slugSchema });

export const commentQuerySchema = z.object({
  postId: z.union([z.string().uuid(), slugSchema]),
});

export const blogCommentSchema = z.object({
  postId: z.union([z.string().uuid(), slugSchema]),
  parentCommentId: z.string().uuid().nullable().optional(),
  authorName: z.string().trim().min(1).max(160),
  authorEmail: z.string().trim().email().max(254),
  body: z.string().trim().min(1).max(5000),
});

export const donationRecordSchema = z.object({
  campaignSlug: slugSchema,
  donorName: z.string().trim().min(1).max(160),
  donorEmail: z.string().trim().email().max(254),
  donorPhone: z.string().trim().max(50).nullable().optional(),
  amount: z.coerce.number().positive().max(10_000_000),
  currency: z.string().regex(/^[A-Z]{3}$/).default("NGN"),
  frequency: z.enum(["one-time", "monthly", "sponsor"]).default("one-time"),
});
