import { z } from "zod";
import { safeUrlSchema } from "@/utils/safeUrl";
import { optionalDateTimeSchema } from "./common";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(160);

const contentBlockSchema = z.object({
  type: z.enum(["paragraph", "heading", "quote", "callout", "list", "listItem", "image", "embed", "divider"]),
  text: z.string().max(5000).optional(),
  title: z.string().max(200).optional(),
  level: z.number().int().min(1).max(4).optional(),
  src: z.string().max(2048).optional(),
  alt: z.string().max(500).optional(),
  caption: z.string().max(1000).optional(),
});

export const blogPostSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.preprocess(
    (val) => (typeof val === "string" && !val.trim() ? undefined : val),
    slugSchema.optional()
  ),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(1000).optional(),
  badge: z.string().trim().max(80).optional(),
  format: z.string().trim().max(80).optional(),
  readTime: z.string().trim().max(40).optional(),
  displayDate: z.string().trim().max(100).optional(),
  image: safeUrlSchema.optional(),
  excerpt: z.string().trim().max(1000).optional(),
  content: z.array(contentBlockSchema).max(500).optional(),
  authorId: z.string().uuid().optional(),
  categoryIds: z.array(z.string().uuid()).max(50).optional(),
  primaryCategoryId: z.string().uuid().optional(),
  relatedPostIds: z.array(z.string().uuid()).max(20).optional(),
  seo: z
    .object({
      title: z.string().trim().max(200).optional(),
      description: z.string().trim().max(500).optional(),
      ogTitle: z.string().trim().max(200).optional(),
      ogDescription: z.string().trim().max(500).optional(),
      ogImageUrl: safeUrlSchema.optional(),
      noIndex: z.boolean().optional(),
    })
    .optional(),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  scheduledAt: optionalDateTimeSchema,
});

export const blogPostListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  category: z.string().trim().max(80).optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
  featured: z.union([z.literal("true"), z.literal("false")]).optional(),
});

export const blogAuthorSchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema,
  name: z.string().trim().min(1).max(160),
  bio: z.string().trim().max(2000).optional(),
  avatar: safeUrlSchema.optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});

export const blogCategorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema,
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().max(1000).optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});

export const commentListQuerySchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "spam", "hidden"]).optional(),
  search: z.string().trim().max(160).optional(),
});

export const commentModerationSchema = z.object({
  id: z.string().uuid(),
  action: z
    .enum(["approve", "approved", "reject", "rejected", "spam", "hide", "hidden"])
    .transform((val) => {
      if (val === "approved") return "approve";
      if (val === "rejected") return "reject";
      if (val === "hidden") return "hide";
      return val;
    }),
  notes: z.string().trim().max(2000).optional(),
});

