import { z } from "zod";
import { optionalDateTimeSchema } from "./common";

export const MEDIA_UPLOAD_LIMITS = {
  image: {
    maxBytes: 10 * 1024 * 1024,
    mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    formats: ["jpg", "jpeg", "png", "webp", "avif"],
  },
  video: {
    maxBytes: 250 * 1024 * 1024,
    mimeTypes: ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"],
    formats: ["mp4", "webm", "mov", "m4v"],
  },
  audio: {
    maxBytes: 50 * 1024 * 1024,
    mimeTypes: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/x-m4a", "audio/aac", "audio/ogg", "audio/flac"],
    formats: ["mp3", "wav", "m4a", "aac", "ogg", "flac"],
  },
};

export const mediaTypeSchema = z.enum(["image", "video", "audio"]);

const optionalCloudinaryDimensionSchema = z.preprocess(
  (value) => (value === 0 || value === "0" || value === "" ? null : value),
  z.coerce.number().int().positive().nullable().optional()
);

export const signedUploadRequestSchema = z
  .object({
    mediaType: mediaTypeSchema,
    fileName: z.string().trim().min(1).max(255),
    mimeType: z.string().trim().toLowerCase(),
    bytes: z.coerce.number().int().positive(),
  })
  .superRefine((value, context) => {
    const limits = MEDIA_UPLOAD_LIMITS[value.mediaType];
    if (!limits.mimeTypes.includes(value.mimeType)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["mimeType"], message: "Unsupported file type." });
    }
    if (value.bytes > limits.maxBytes) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bytes"],
        message: `File exceeds the ${Math.floor(limits.maxBytes / 1024 / 1024)}MB limit.`,
      });
    }
  });

export const registerCloudinaryUploadSchema = z.object({
  asset: z.object({
    mediaType: mediaTypeSchema,
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(160),
    title: z.string().trim().min(1).max(200),
    summary: z.string().trim().max(1000).nullable().optional(),
    altText: z.string().trim().max(500).nullable().optional(),
    caption: z.string().trim().max(1000).nullable().optional(),
  }),
  upload: z.object({
    public_id: z.string().trim().min(1).max(500),
    resource_type: z.enum(["image", "video"]),
    secure_url: z.string().url().refine((value) => value.startsWith("https://"), "A secure URL is required."),
    url: z.string().url().optional(),
    format: z.string().trim().min(1).max(20),
    width: optionalCloudinaryDimensionSchema,
    height: optionalCloudinaryDimensionSchema,
    duration: z.coerce.number().nonnegative().nullable().optional(),
    bytes: z.coerce.number().int().nonnegative(),
  }),
});

export const registerYouTubeSchema = z.object({
  url: z.string().trim().url().max(2048),
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(1000).nullable().optional(),
  altText: z.string().trim().max(500).nullable().optional(),
  caption: z.string().trim().max(1000).nullable().optional(),
});

export const mediaListQuerySchema = z.object({
  search: z.string().trim().max(160).optional(),
  type: mediaTypeSchema.optional(),
  source: z.enum(["cloudinary", "youtube"]).optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
});

export const mediaUpdateSchema = z.object({
  id: z.string().uuid(),
  altText: z.string().trim().max(500).nullable().optional(),
  caption: z.string().trim().max(1000).nullable().optional(),
  title: z.string().trim().min(1).max(200).optional(),
  summary: z.string().trim().max(1000).nullable().optional(),
  body: z.record(z.unknown()).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  duration_seconds: z.coerce.number().nonnegative().nullable().optional(),
  status: z.enum(["draft", "published", "scheduled", "archived"]).optional(),
  scheduledAt: optionalDateTimeSchema,
});

export const collectionAssignSchema = z.object({
  assetId: z.string().uuid(),
  collectionIds: z.array(z.string().uuid()).max(100),
});
