import { z } from "zod";
import { slugSchema } from "./common";

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
};

const mediaTypeSchema = z.enum(["image", "video"]);

export const cloudinaryUploadRequestSchema = z
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

export const mediaAssetDraftSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1).max(200),
  summary: z.string().trim().max(1000).nullable().optional(),
  altText: z.string().trim().max(500).nullable().optional(),
  caption: z.string().trim().max(1000).nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const cloudinaryUploadResultSchema = z.object({
  public_id: z.string().trim().min(1).max(500),
  resource_type: z.enum(["image", "video"]),
  secure_url: z.string().url().refine((value) => value.startsWith("https://"), "A secure URL is required."),
  url: z.string().url().optional(),
  format: z.string().trim().min(1).max(20),
  width: z.coerce.number().int().positive().nullable().optional(),
  height: z.coerce.number().int().positive().nullable().optional(),
  duration: z.coerce.number().nonnegative().nullable().optional(),
  bytes: z.coerce.number().int().nonnegative(),
});

export const youtubeMediaDraftSchema = mediaAssetDraftSchema.extend({
  url: z.string().trim().url().max(2048),
});
