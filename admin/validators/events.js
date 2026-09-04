import { z } from "zod";
import { safeUrlSchema } from "@/utils/safeUrl";
import { optionalDateTimeSchema } from "./common";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(160);

export const eventSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: z.preprocess((value) => value === "" ? undefined : value, slugSchema.optional()),
    title: z.string().trim().min(1).max(200),
    summary: z.string().trim().max(1000).optional(),
    description: z.string().trim().max(2000).optional(),
    category: z.string().trim().max(80).optional(),
    categoryTag: z.string().trim().max(80).optional(),
    location: z.string().trim().max(300).optional(),
    venueName: z.string().trim().max(300).optional(),
    venueAddress: z.string().trim().max(500).optional(),
    isOnline: z.boolean().default(false),
    onlineUrl: safeUrlSchema.optional(),
    startsAt: z.preprocess((value) => value === "" ? undefined : value, z.string().datetime({ offset: true }).optional()),
    endsAt: z.preprocess((value) => value === "" ? undefined : value, z.string().datetime({ offset: true }).optional()),
    timezone: z.string().trim().max(80).optional(),
    time: z.string().trim().max(80).optional(),
    image: safeUrlSchema.optional(),
    heroImage: safeUrlSchema.optional(),
    startingPrice: z.string().trim().max(40).optional(),
    ticketLink: safeUrlSchema.optional(),
    gallery: z.array(safeUrlSchema).max(50).optional(),
    youtubeUrl: safeUrlSchema.optional(),
    aboutParagraphs: z.array(z.string().trim().max(5000)).max(50).optional(),
    speakers: z.array(z.record(z.unknown())).max(100).optional(),
    performingArtists: z.array(z.record(z.unknown())).max(100).optional(),
    partners: z.array(z.union([z.string().trim().max(200), z.record(z.unknown())])).max(100).optional(),
    schedule: z.array(z.record(z.unknown())).max(100).optional(),
    faqs: z.array(z.record(z.unknown())).max(100).optional(),
    ticketTiers: z.array(z.record(z.unknown())).max(50).optional(),
    attendees: z.string().trim().max(160).optional(),
    recapLink: safeUrlSchema.optional(),
    venue: z.string().trim().max(500).optional(),
    dateString: z.string().trim().max(200).optional(),
    isPopular: z.boolean().default(false),
    featured: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
    body: z.record(z.unknown()).optional(),
    categoryIds: z.array(z.string().uuid()).max(50).optional(),
    primaryCategoryId: z.preprocess((value) => value === "" ? undefined : value, z.string().uuid().optional()),
    status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
    scheduledAt: optionalDateTimeSchema,
  })
  .superRefine((value, context) => {
    if (value.status === "scheduled" && !value.scheduledAt) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["scheduledAt"], message: "Scheduled categories require a publish date." });
    }
    if (value.startsAt && value.endsAt && value.endsAt <= value.startsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "End time must be after the start time.",
      });
    }
  });

export const eventListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  category: z.string().trim().max(80).optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
  featured: z.union([z.literal("true"), z.literal("false")]).optional(),
});

export const reorderEventsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export const eventCategorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema,
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().max(1000).optional(),
  scheduledAt: optionalDateTimeSchema,
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});
