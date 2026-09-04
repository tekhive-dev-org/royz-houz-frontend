import { z } from "zod";

/**
 * Shared schema for homepage and about page sections.
 * Supports both standard fields and rich nested section structures (e.g., leader cards,
 * checklist items, mission/vision cards, impact metrics, gallery columns, features).
 */
export const sectionSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain lowercase letters and hyphens only.")
      .max(160),
    title: z.string().trim().min(1, "Title is required").max(200),
    summary: z.string().trim().max(1000).nullable().optional(),
    sortOrder: z.number().int().min(0).optional().default(0),
    sort_order: z.number().int().min(0).optional(),
    visible: z.boolean().optional().default(true),
    status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
    scheduledAt: z.string().datetime({ offset: true }).nullable().optional(),
    body: z.record(z.unknown()).optional(),
  })
  .passthrough();

export const reorderSectionsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
});
