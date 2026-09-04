import { randomUUID } from "node:crypto";
import { getCloudinaryCloudName, getCloudinaryServerClient } from "@/lib/cloudinary/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  MEDIA_UPLOAD_LIMITS,
  cloudinaryUploadRequestSchema,
  cloudinaryUploadResultSchema,
  mediaAssetDraftSchema,
  youtubeMediaDraftSchema,
} from "@/validators/media";
import { normalizeYouTubeUrl } from "@/utils/media/youtube";

function serviceFailure(code, message) {
  return { success: false, error: { code, message } };
}

function serviceSuccess(data, message) {
  return { success: true, data, message };
}

function createCloudinaryPublicId(fileName) {
  const safeBaseName = fileName
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const suffix = randomUUID().replace(/-/g, "").slice(0, 12);
  return `${safeBaseName || "asset"}-${suffix}`;
}

function getUploadFolder(mediaType) {
  return `royz-houz/media/${mediaType}s`;
}

function hasExpectedCloudinaryUrl(secureUrl, cloudName) {
  try {
    const url = new URL(secureUrl);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.startsWith(`/${cloudName}/`);
  } catch {
    return false;
  }
}

function getActorFailure(actorId) {
  if (typeof actorId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(actorId)) {
    return serviceFailure("UNAUTHORIZED", "An authorized administrator is required.");
  }
  return null;
}

/**
 * Creates values for a direct signed Cloudinary upload. It exposes an upload
 * signature and API key, never the API secret. Call this only after the admin
 * API layer has authenticated and authorized the actor.
 */
export function createCloudinarySignedUpload(input) {
  const parsed = cloudinaryUploadRequestSchema.safeParse(input);
  if (!parsed.success) return serviceFailure("VALIDATION_ERROR", "The upload file is not allowed.");

  const { mediaType, fileName } = parsed.data;
  const cloudinary = getCloudinaryServerClient();
  const cloudName = getCloudinaryCloudName();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = getUploadFolder(mediaType);
  const publicId = createCloudinaryPublicId(fileName);
  const signatureParameters = {
    timestamp,
    folder,
    public_id: publicId,
    allowed_formats: MEDIA_UPLOAD_LIMITS[mediaType].formats.join(","),
  };

  return serviceSuccess(
    {
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName,
      resourceType: mediaType,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${mediaType}/upload`,
      timestamp,
      signature: cloudinary.utils.api_sign_request(signatureParameters, process.env.CLOUDINARY_API_SECRET),
      folder,
      publicId,
      allowedFormats: MEDIA_UPLOAD_LIMITS[mediaType].formats,
      maxBytes: MEDIA_UPLOAD_LIMITS[mediaType].maxBytes,
    },
    "Signed upload parameters created."
  );
}

/**
 * Persists metadata from a completed signed Cloudinary upload. The caller must
 * be a protected admin route and pass its server-verified actor ID; publication
 * state is deliberately forced to draft rather than accepted from the client.
 */
export async function createCloudinaryMediaAsset(input, { client, actorId } = {}) {
  const actorFailure = getActorFailure(actorId);
  if (actorFailure) return actorFailure;

  const draft = mediaAssetDraftSchema.safeParse(input?.asset);
  const upload = cloudinaryUploadResultSchema.safeParse(input?.upload);
  if (!draft.success || !upload.success) {
    return serviceFailure("VALIDATION_ERROR", "The media asset metadata is invalid.");
  }

  const mediaType = upload.data.resource_type;
  const limits = MEDIA_UPLOAD_LIMITS[mediaType];
  if (!limits.formats.includes(upload.data.format.toLowerCase()) || upload.data.bytes > limits.maxBytes) {
    return serviceFailure("VALIDATION_ERROR", "The uploaded file does not meet the media policy.");
  }

  const expectedFolder = `${getUploadFolder(mediaType)}/`;
  if (!upload.data.public_id.startsWith(expectedFolder) || !hasExpectedCloudinaryUrl(upload.data.secure_url, getCloudinaryCloudName())) {
    return serviceFailure("VALIDATION_ERROR", "The upload result is not from the permitted Cloudinary location.");
  }

  const supabase = client || createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      slug: draft.data.slug,
      title: draft.data.title,
      summary: draft.data.summary || null,
      media_source: "cloudinary",
      media_type: mediaType,
      url: upload.data.url || upload.data.secure_url,
      secure_url: upload.data.secure_url,
      cloudinary_public_id: upload.data.public_id,
      cloudinary_resource_type: mediaType,
      format: upload.data.format.toLowerCase(),
      width: upload.data.width || null,
      height: upload.data.height || null,
      duration_seconds: upload.data.duration || null,
      file_size_bytes: upload.data.bytes,
      alt_text: draft.data.altText || null,
      caption: draft.data.caption || null,
      body: { metadata: draft.data.metadata || {} },
      status: "draft",
      created_by: actorId,
      updated_by: actorId,
    })
    .select("id, slug, media_source, media_type, secure_url, cloudinary_public_id, status")
    .single();

  if (error) return serviceFailure("MEDIA_PERSIST_FAILED", "The uploaded media could not be saved.");
  return serviceSuccess(data, "Media asset saved as a draft.");
}

export async function createYouTubeMediaAsset(input, { client, actorId } = {}) {
  const actorFailure = getActorFailure(actorId);
  if (actorFailure) return actorFailure;

  const draft = youtubeMediaDraftSchema.safeParse(input);
  if (!draft.success) return serviceFailure("VALIDATION_ERROR", "The media asset metadata is invalid.");

  let youtube;
  try {
    youtube = normalizeYouTubeUrl(draft.data.url);
  } catch {
    return serviceFailure("VALIDATION_ERROR", "Enter a valid YouTube watch, short, or youtu.be URL.");
  }

  const supabase = client || createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      slug: draft.data.slug,
      title: draft.data.title,
      summary: draft.data.summary || null,
      media_source: "youtube",
      media_type: "video",
      url: youtube.originalUrl,
      secure_url: youtube.embedUrl,
      youtube_original_url: youtube.originalUrl,
      youtube_video_id: youtube.videoId,
      youtube_embed_url: youtube.embedUrl,
      youtube_thumbnail_url: youtube.thumbnailUrl,
      alt_text: draft.data.altText || null,
      caption: draft.data.caption || null,
      body: { metadata: draft.data.metadata || {} },
      status: "draft",
      created_by: actorId,
      updated_by: actorId,
    })
    .select("id, slug, media_source, media_type, youtube_video_id, youtube_embed_url, status")
    .single();

  if (error) return serviceFailure("MEDIA_PERSIST_FAILED", "The YouTube media could not be saved.");
  return serviceSuccess(data, "YouTube media saved as a draft.");
}

async function hasDeletionReferences(supabase, assetId) {
  const [collectionResult, explicitReferenceResult] = await Promise.all([
    supabase.from("media_collection_items").select("media_collection_id").eq("media_asset_id", assetId).limit(1),
    supabase.from("media_asset_references").select("id").eq("media_asset_id", assetId).limit(1),
  ]);

  // A failed reference check must block deletion rather than risk deleting a
  // file that remains in published content.
  if (collectionResult.error || explicitReferenceResult.error) return { blocked: true };
  return { blocked: Boolean(collectionResult.data?.length || explicitReferenceResult.data?.length) };
}

/**
 * Safely decommissions a Cloudinary asset. It uses only the stored public ID,
 * blocks published/referenced assets, destroys the remote file, and archives
 * the database row rather than losing the identifier needed for audit/retry.
 */
export async function decommissionCloudinaryMediaAsset(assetId, { client, actorId } = {}) {
  const actorFailure = getActorFailure(actorId);
  if (actorFailure) return actorFailure;

  const supabase = client || createSupabaseServiceRoleClient();
  const { data: asset, error } = await supabase
    .from("media_assets")
    .select("id, media_source, status, cloudinary_public_id, cloudinary_resource_type, body")
    .eq("id", assetId)
    .maybeSingle();

  if (error || !asset) return serviceFailure("NOT_FOUND", "The media asset was not found.");
  if (asset.media_source !== "cloudinary" || !asset.cloudinary_public_id) {
    return serviceFailure("BAD_REQUEST", "Only Cloudinary media assets can be decommissioned this way.");
  }
  if (asset.status === "published") {
    return serviceFailure("CONFLICT", "Unpublish and safely replace this media before deletion.");
  }
  if (!["image", "video"].includes(asset.cloudinary_resource_type)) {
    return serviceFailure("BAD_REQUEST", "The stored Cloudinary resource type is not supported.");
  }

  const references = await hasDeletionReferences(supabase, asset.id);
  if (references.blocked) {
    return serviceFailure("CONFLICT", "Remove or safely replace all content references before deletion.");
  }

  try {
    const cloudinary = getCloudinaryServerClient();
    const result = await cloudinary.uploader.destroy(asset.cloudinary_public_id, {
      resource_type: asset.cloudinary_resource_type,
      invalidate: true,
    });
    if (!["ok", "not found"].includes(result.result)) {
      return serviceFailure("MEDIA_DELETE_FAILED", "Cloudinary could not delete the media asset.");
    }
  } catch {
    return serviceFailure("MEDIA_DELETE_FAILED", "Cloudinary could not delete the media asset.");
  }

  const { error: archiveError } = await supabase
    .from("media_assets")
    .update({
      status: "archived",
      body: {
        ...(asset.body || {}),
        cloudinary: { ...(asset.body?.cloudinary || {}), deleted_at: new Date().toISOString() },
      },
      updated_by: actorId,
    })
    .eq("id", asset.id);

  if (archiveError) return serviceFailure("MEDIA_ARCHIVE_FAILED", "The media was deleted but could not be archived.");
  return serviceSuccess({ id: asset.id }, "Media asset decommissioned.");
}
