import { z } from "zod";
import { requiredSafeUrlSchema, safeUrlSchema } from "@/utils/safeUrl";

export const idParamSchema = z.string().uuid();

export const reorderSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export const navigationItemSchema = z.object({
  id: z.string().uuid().optional(),
  label: z.string().trim().min(1, "Label is required").max(160),
  href: requiredSafeUrlSchema,
  placement: z.enum(["header", "utility"]).default("header"),
  sortOrder: z.number().int().min(0).optional(),
  sort_order: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
});

export const footerSectionSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens.")
    .max(160),
  title: z.string().trim().min(1, "Title is required").max(200),
  summary: z.string().trim().max(1000).nullable().optional(),
  content: z.record(z.unknown()).optional().default({}),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
});

export const footerLinkSchema = z
  .object({
    id: z.string().uuid().optional(),
    footerSectionId: z.string().uuid().optional(),
    footer_section_id: z.string().uuid().optional(),
    label: z.string().trim().min(1, "Link label is required").max(160),
    href: requiredSafeUrlSchema,
    sortOrder: z.number().int().min(0).optional(),
    sort_order: z.number().int().min(0).optional(),
    status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  })
  .transform((data) => ({
    ...data,
    footerSectionId: data.footerSectionId || data.footer_section_id,
  }));

export const socialLinkSchema = z.object({
  id: z.string().uuid().optional(),
  platform: z
    .string()
    .trim()
    .min(1, "Platform name is required")
    .max(80),
  url: requiredSafeUrlSchema,
  placement: z.enum(["global", "header", "footer", "contact"]).default("global"),
  label: z.string().trim().max(160).nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  sort_order: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
});

export const siteSettingSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Key must use lowercase letters, numbers, and hyphens.")
    .max(160),
  title: z.string().trim().min(1, "Title is required").max(200),
  summary: z.string().trim().max(1000).nullable().optional(),
  content: z.record(z.unknown()).optional().default({}),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
  sortOrder: z.number().int().min(0).optional(),
  sort_order: z.number().int().min(0).optional(),
});

export const seoSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  summary: z.string().trim().max(500).nullable().optional(),
  canonicalPath: z.string().trim().regex(/^\//, "Canonical path must start with /").max(300).nullable().optional(),
  ogTitle: z.string().trim().max(200).nullable().optional(),
  ogDescription: z.string().trim().max(500).nullable().optional(),
  ogImageUrl: safeUrlSchema.nullable().optional(),
  noIndex: z.boolean().default(false),
});

export const announcementSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(1000),
  enabled: z.boolean().default(true),
  link: safeUrlSchema.nullable().optional(),
});

export const contactInfoSchema = z.object({
  address: z.string().trim().max(500).optional().default(""),
  email: z
    .string()
    .trim()
    .max(254)
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), "Enter a valid email address.")
    .optional()
    .default(""),
  phone: z.string().trim().max(50).optional().default(""),
  website: safeUrlSchema.nullable().optional(),
});
