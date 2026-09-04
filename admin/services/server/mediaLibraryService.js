import { randomUUID } from "node:crypto";
import { createAdminServiceRoleClient } from "@/lib/supabase/service-role";
import { getAdminCloudinaryApiKey, getAdminCloudinaryClient, getAdminCloudinaryCloudName } from "@/lib/cloudinary/server";
import { writeSuccessfulAdminMutationAudit } from "./adminAuthorizationService";
import { MEDIA_UPLOAD_LIMITS } from "@/validators/media";
import { normalizeYouTubeUrl } from "@/utils/media/youtube";

export function serviceSuccess(data, message = "Request completed") {
  return { success: true, data, message };
}

export function serviceFailure(code, message) {
  return { success: false, error: { code, message } };
}

function getClient(client) {
  return client || createAdminServiceRoleClient();
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

function getCloudinaryResourceType(mediaType) {
  // Cloudinary processes audio through its video resource pipeline while the
  // application retains audio as the semantic database media type.
  return mediaType === "audio" ? "video" : mediaType;
}

function hasExpectedCloudinaryUrl(secureUrl, cloudName) {
  try {
    const url = new URL(secureUrl);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" && url.pathname.startsWith(`/${cloudName}/`);
  } catch {
    return false;
  }
}

export function createSignedUpload({ mediaType, fileName }) {
  const cloudinary = getAdminCloudinaryClient();
  const cloudName = getAdminCloudinaryCloudName();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = getUploadFolder(mediaType);
  const resourceType = getCloudinaryResourceType(mediaType);
  const publicId = createCloudinaryPublicId(fileName);
  const signatureParameters = {
    timestamp,
    folder,
    public_id: publicId,
    allowed_formats: MEDIA_UPLOAD_LIMITS[mediaType].formats.join(","),
  };

  return serviceSuccess({
    apiKey: getAdminCloudinaryApiKey(),
    cloudName,
    mediaType,
    resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
    timestamp,
    signature: cloudinary.utils.api_sign_request(signatureParameters, process.env.CLOUDINARY_API_SECRET),
    folder,
    publicId,
    allowedFormats: MEDIA_UPLOAD_LIMITS[mediaType].formats,
    maxBytes: MEDIA_UPLOAD_LIMITS[mediaType].maxBytes,
  });
}

export async function registerCloudinaryUpload({ asset, upload, actorUserId }, { client } = {}) {
  const supabase = getClient(client);
  const mediaType = asset.mediaType;
  const resourceType = getCloudinaryResourceType(mediaType);
  const limits = MEDIA_UPLOAD_LIMITS[mediaType];
  if (upload.resource_type !== resourceType) {
    return serviceFailure("VALIDATION_ERROR", "The uploaded Cloudinary resource type does not match the requested media type.");
  }
  if (!limits.formats.includes(upload.format.toLowerCase()) || upload.bytes > limits.maxBytes) {
    return serviceFailure("VALIDATION_ERROR", "The uploaded file does not meet the media policy.");
  }

  const expectedFolder = `${getUploadFolder(mediaType)}/`;
  if (!upload.public_id.startsWith(expectedFolder) || !hasExpectedCloudinaryUrl(upload.secure_url, getAdminCloudinaryCloudName())) {
    return serviceFailure("VALIDATION_ERROR", "The upload result is not from the permitted Cloudinary location.");
  }

  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      slug: asset.slug,
      title: asset.title,
      summary: asset.summary || null,
      media_source: "cloudinary",
      media_type: mediaType,
      url: upload.url || upload.secure_url,
      secure_url: upload.secure_url,
      cloudinary_public_id: upload.public_id,
      cloudinary_resource_type: resourceType,
      format: upload.format.toLowerCase(),
      width: upload.width || null,
      height: upload.height || null,
      duration_seconds: upload.duration ?? null,
      file_size_bytes: upload.bytes,
      alt_text: asset.altText || null,
      caption: asset.caption || null,
      status: "draft",
      created_by: actorUserId,
      updated_by: actorUserId,
    })
    .select("id, slug, media_source, media_type, secure_url, cloudinary_public_id, duration_seconds, width, height, format, status")
    .single();

  if (error) return serviceFailure("MEDIA_PERSIST_FAILED", "The uploaded media could not be saved.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "media_assets.upload", entityType: "media_assets", entityId: data.id, newValues: { source: "cloudinary", type: mediaType } },
    { client: supabase }
  );

  return serviceSuccess(data, "Media asset saved as a draft.");
}

export async function registerYouTube({ url, title, summary, altText, caption, actorUserId }, { client } = {}) {
  let youtube;
  try {
    youtube = normalizeYouTubeUrl(url);
  } catch {
    return serviceFailure("VALIDATION_ERROR", "Enter a valid YouTube watch, short, or youtu.be URL.");
  }

  const supabase = getClient(client);
  const slug = `${youtube.videoId.toLowerCase()}-video`;
  const { data, error } = await supabase
    .from("media_assets")
    .insert({
      slug,
      title,
      summary: summary || null,
      media_source: "youtube",
      media_type: "video",
      url: youtube.originalUrl,
      secure_url: youtube.embedUrl,
      youtube_original_url: youtube.originalUrl,
      youtube_video_id: youtube.videoId,
      youtube_embed_url: youtube.embedUrl,
      youtube_thumbnail_url: youtube.thumbnailUrl,
      alt_text: altText || null,
      caption: caption || null,
      status: "draft",
      created_by: actorUserId,
      updated_by: actorUserId,
    })
    .select("id, slug, media_source, media_type, youtube_video_id, youtube_embed_url, status")
    .single();

  if (error) return serviceFailure("MEDIA_PERSIST_FAILED", "The YouTube media could not be saved.");

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "media_assets.upload", entityType: "media_assets", entityId: data.id, newValues: { source: "youtube", type: "video" } },
    { client: supabase }
  );

  return serviceSuccess(data, "YouTube media saved as a draft.");
}

export async function listMediaLibrary(client, { search, type, source, status } = {}) {
  const supabase = getClient(client);
  let query = supabase.from("media_assets").select("*");

  if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,caption.ilike.%${search}%`);
  if (type) query = query.eq("media_type", type);
  if (source) query = query.eq("media_source", source);
  if (status) query = query.eq("status", status);

  query = query.order("created_at", { ascending: false }).limit(500);

  const { data, error } = await query;
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load media.");
  return serviceSuccess(data || []);
}

export async function getMediaAsset(client, id) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("media_assets").select("*").eq("id", id).maybeSingle();
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load the asset.");
  if (!data) return serviceFailure("NOT_FOUND", "Media asset was not found.");
  return serviceSuccess(data);
}

export async function getMediaUsage(client, id) {
  const supabase = getClient(client);
  const [collections, references] = await Promise.all([
    supabase
      .from("media_collection_items")
      .select("media_collection_id, media_collections(title, slug)")
      .eq("media_asset_id", id),
    supabase.from("media_asset_references").select("content_type, content_id, field_path").eq("media_asset_id", id),
  ]);

  if (collections.error) return serviceFailure("QUERY_FAILED", "Unable to load usage references.");

  return serviceSuccess({
    collections: (collections.data || []).map((row) => ({
      id: row.media_collection_id,
      title: row.media_collections?.title || "",
      slug: row.media_collections?.slug || "",
    })),
    references: (references.data || []).map((row) => ({
      contentType: row.content_type,
      contentId: row.content_id,
      fieldPath: row.field_path,
    })),
  });
}

export async function updateMediaAsset(client, { id, actorUserId, fields }) {
  const supabase = getClient(client);
  const current = await supabase.from("media_assets").select("body, status, published_at, scheduled_at").eq("id", id).maybeSingle();
  if (current.error || !current.data) return serviceFailure("NOT_FOUND", "Media asset was not found.");

  const update = {
    ...(fields.altText !== undefined ? { alt_text: fields.altText ?? null } : {}),
    ...(fields.caption !== undefined ? { caption: fields.caption ?? null } : {}),
    ...(fields.title !== undefined ? { title: fields.title } : {}),
    ...(fields.summary !== undefined ? { summary: fields.summary ?? null } : {}),
    ...(fields.body ? { body: { ...(current.data.body || {}), ...fields.body } } : {}),
    ...(fields.featured !== undefined ? { featured: fields.featured } : {}),
    ...(fields.sortOrder !== undefined ? { sort_order: fields.sortOrder } : {}),
    ...(fields.duration_seconds !== undefined ? { duration_seconds: fields.duration_seconds ?? null } : {}),
    updated_by: actorUserId,
  };

  if (fields.status) {
    update.status = fields.status;
    update.published_at = fields.status === "published" ? new Date().toISOString() : null;
    update.scheduled_at = fields.status === "scheduled" ? fields.scheduledAt || null : null;
  }

  const { data, error } = await supabase
    .from("media_assets")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) return serviceFailure("PERSIST_FAILED", "Unable to update the asset.");
  await writeSuccessfulAdminMutationAudit(
    {
      actorUserId,
      action: "media_assets.update",
      entityType: "media_assets",
      entityId: id,
      newValues: { status: update.status, featured: update.featured, sort_order: update.sort_order },
    },
    { client: supabase }
  );
  return serviceSuccess(data);
}

export async function archiveMediaAsset(client, { id, actorUserId }) {
  const supabase = getClient(client);
  const { error } = await supabase.from("media_assets").update({ status: "archived" }).eq("id", id);
  if (error) return serviceFailure("ARCHIVE_FAILED", "Unable to archive the asset.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "media_assets.archive", entityType: "media_assets", entityId: id, newValues: { status: "archived" } },
    { client: supabase }
  );
  return serviceSuccess({ id, status: "archived" });
}

async function hasDeletionReferences(supabase, assetId) {
  const [collectionResult, referenceResult] = await Promise.all([
    supabase.from("media_collection_items").select("media_collection_id").eq("media_asset_id", assetId).limit(1),
    supabase.from("media_asset_references").select("id").eq("media_asset_id", assetId).limit(1),
  ]);
  if (collectionResult.error || referenceResult.error) return { blocked: true };
  return { blocked: Boolean(collectionResult.data?.length || referenceResult.data?.length) };
}

/**
 * Permanently deletes a Cloudinary asset using its stored public ID. Blocks
 * published or referenced assets; archives the metadata row after a successful
 * destroy so identifiers remain available for audit.
 */
export async function deleteCloudinaryAsset(client, { id, actorUserId }) {
  const supabase = getClient(client);
  const { data: asset, error } = await supabase
    .from("media_assets")
    .select("id, media_source, status, cloudinary_public_id, cloudinary_resource_type, body")
    .eq("id", id)
    .maybeSingle();

  if (error || !asset) return serviceFailure("NOT_FOUND", "The media asset was not found.");
  if (asset.media_source !== "cloudinary" || !asset.cloudinary_public_id) {
    return serviceFailure("BAD_REQUEST", "Only Cloudinary media assets can be deleted this way.");
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
    const cloudinary = getAdminCloudinaryClient();
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
      updated_by: actorUserId,
    })
    .eq("id", asset.id);

  if (archiveError) return serviceFailure("MEDIA_ARCHIVE_FAILED", "The media was deleted but could not be archived.");
  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "media_assets.delete", entityType: "media_assets", entityId: asset.id },
    { client: supabase }
  );
  return serviceSuccess({ id: asset.id }, "Media asset decommissioned.");
}

export async function listMediaCollections(client) {
  const supabase = getClient(client);
  const { data, error } = await supabase.from("media_collections").select("id, slug, title, summary").order("sort_order", { ascending: true });
  if (error) return serviceFailure("QUERY_FAILED", "Unable to load collections.");
  return serviceSuccess(data || []);
}

export async function assignCollections(client, { assetId, collectionIds, actorUserId }) {
  const supabase = getClient(client);
  const current = await supabase.from("media_collection_items").select("media_collection_id").eq("media_asset_id", assetId);
  const currentIds = (current.data || []).map((row) => row.media_collection_id);
  const toAdd = collectionIds.filter((id) => !currentIds.includes(id));
  const toRemove = currentIds.filter((id) => !collectionIds.includes(id));

  if (toRemove.length) {
    for (const collectionId of toRemove) {
      await supabase.from("media_collection_items").delete().eq("media_asset_id", assetId).eq("media_collection_id", collectionId);
    }
  }
  if (toAdd.length) {
    const rows = toAdd.map((collectionId, index) => ({
      media_collection_id: collectionId,
      media_asset_id: assetId,
      sort_order: index,
      created_by: actorUserId,
    }));
    const { error } = await supabase.from("media_collection_items").insert(rows);
    if (error) return serviceFailure("PERSIST_FAILED", "Unable to assign collections.");
  }

  await writeSuccessfulAdminMutationAudit(
    { actorUserId, action: "media_assets.assign_collections", entityType: "media_assets", entityId: assetId, newValues: { collectionIds } },
    { client: supabase }
  );
  return serviceSuccess({ assetId, collectionIds });
}
