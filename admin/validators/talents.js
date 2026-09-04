import { z } from "zod";
import { safeUrlSchema } from "@/utils/safeUrl";
import { optionalDateTimeSchema } from "./common";

const slugSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .max(160);

const optionalSlugSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim().toLowerCase() || undefined : value),
  slugSchema.optional()
);

const compactText = (max) => z.string().trim().max(max).optional();

const editorialRatingSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.number().min(0).max(5).optional()
);

const followerDisplaySchema = z.preprocess(
  (value) =>
    typeof value === "string"
      ? value.trim().replace(/\s+followers?$/i, "") || undefined
      : value,
  z.string().max(30).optional()
);

const videoSchema = z
  .object({
    id: compactText(160),
    slug: optionalSlugSchema,
    title: compactText(300),
    artist: compactText(160),
    duration: compactText(30),
    thumbnail: safeUrlSchema.optional(),
    videoUrl: safeUrlSchema.optional(),
  })
  .passthrough();

const musicTrackSchema = z
  .object({
    id: compactText(160),
    title: compactText(300),
    duration: compactText(30),
    streams: compactText(60),
    plays: compactText(60),
    trackUrl: safeUrlSchema.optional(),
  })
  .passthrough();

const publicationSchema = z
  .object({
    id: compactText(160),
    title: compactText(300),
    type: compactText(100),
    year: compactText(20),
    publisher: compactText(160),
    url: safeUrlSchema.optional(),
  })
  .passthrough();

const socialsSchema = z
  .object({
    facebook: safeUrlSchema.optional(),
    spotify: safeUrlSchema.optional(),
    appleMusic: safeUrlSchema.optional(),
    youtube: safeUrlSchema.optional(),
    instagram: safeUrlSchema.optional(),
    twitter: safeUrlSchema.optional(),
    tiktok: safeUrlSchema.optional(),
    soundcloud: safeUrlSchema.optional(),
  })
  .passthrough();

export const talentSchema = z
  .object({
    id: z.string().uuid().optional(),
    slug: optionalSlugSchema,
    name: z.string().trim().min(1).max(160),
    category: z.string().trim().max(80).optional(),
    categoryKey: z.string().trim().max(80).optional(),
    profession: z.string().trim().max(80).optional(),
    genre: z.string().trim().max(80).optional(),
    badge: z.string().trim().max(80).optional(),
    subtitle: z.string().trim().max(300).optional(),
    bio: z.string().trim().max(10000).optional(),
    location: z.string().trim().max(200).optional(),
    rating: editorialRatingSchema,
    reviewCount: z.coerce.number().int().nonnegative().optional(),
    followers: followerDisplaySchema,
    bookingPrice: z.string().trim().max(60).optional(),
    startingRate: z.string().trim().max(60).optional(),
    availability: z.string().trim().max(80).optional(),
    image: safeUrlSchema.optional(),
    alt: z.string().trim().max(300).optional(),
    coverImage: safeUrlSchema.optional(),
    isHot: z.boolean().default(false),
    tabs: z.array(z.string().trim().max(40)).max(20).optional(),
    awards: z.array(z.string().trim().max(300)).max(100).optional(),
    achievements: z.array(z.string().trim().max(300)).max(100).optional(),
    galleryImages: z.array(safeUrlSchema).max(100).optional(),
    videos: z.array(videoSchema).max(100).optional(),
    musicTracks: z.array(musicTrackSchema).max(100).optional(),
    publications: z.array(publicationSchema).max(100).optional(),
    socials: socialsSchema.optional(),
    videoReel: z.record(z.unknown()).optional(),
    categoryIds: z.array(z.string().uuid()).max(50).optional(),
    primaryCategoryId: z.string().uuid().optional(),
    status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
    scheduledAt: optionalDateTimeSchema,
    featured: z.boolean().default(false),
    sortOrder: z.number().int().min(0).default(0),
  })
  .passthrough();

export const talentListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  category: z.string().trim().max(80).optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
  featured: z.union([z.literal("true"), z.literal("false")]).optional(),
});

export const reorderTalentsSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(500),
});

export const talentCategorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: slugSchema,
  title: z.string().trim().min(1).max(160),
  summary: z.string().trim().max(1000).optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("published"),
});
