import { createHash } from "node:crypto";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { listPublicRecords } from "@/repositories/publicContentRepository";
import {
  formatDisplayViews,
  parseBaselineViews,
  toMediaGalleryItem,
  toMediaTrack,
  toMediaVideo,
  toPublicMediaAsset,
} from "@/adapters/mediaAdapter";
import { getContentClient, normalizeSearch, serviceFailure, serviceSuccess } from "./serviceUtils";

const PUBLISHED_MEDIA_FILTERS = () => [
  { column: "status", value: "published" },
  { column: "published_at", operator: "not.is", value: "null" },
  { column: "published_at", operator: "lte", value: new Date().toISOString() },
];

/**
 * Reads public media directly from the RLS-protected media_assets table. The
 * explicit publication filters also keep this contract safe if RLS changes.
 */
export async function listMedia({ page, limit, search, type, client } = {}) {
  try {
    const result = await listPublicRecords(getContentClient(client), {
      source: "media_assets",
      pagination: page && limit ? { page, limit, from: (page - 1) * limit, to: page * limit - 1 } : null,
      order: { column: "sort_order" },
      filters: [...PUBLISHED_MEDIA_FILTERS(), ...(type ? [{ column: "media_type", value: type }] : [])],
      search: { value: normalizeSearch(search), columns: ["title", "summary"] },
    });
    if (!result.success) return serviceFailure(result.error);

    const adapter = type === "audio" ? toMediaTrack : type === "image" ? toMediaGalleryItem : toMediaVideo;
    return serviceSuccess(result.data.map(adapter), "Media loaded successfully", result.pagination);
  } catch {
    return serviceFailure({ code: "CONTENT_SERVICE_UNAVAILABLE", message: "Media is currently unavailable." });
  }
}

export async function listPublicMediaAssets({ client } = {}) {
  try {
    const result = await listPublicRecords(getContentClient(client), {
      source: "media_assets",
      order: { column: "sort_order" },
      filters: PUBLISHED_MEDIA_FILTERS(),
    });
    if (!result.success) return serviceFailure(result.error);

    return serviceSuccess(result.data.map(toPublicMediaAsset), "Media loaded successfully");
  } catch {
    return serviceFailure({ code: "CONTENT_SERVICE_UNAVAILABLE", message: "Media is currently unavailable." });
  }
}

function adaptMediaRow(row) {
  if (row.media_type === "audio") return { ...toMediaTrack(row), mediaType: "music" };
  if (row.media_type === "image") return { ...toMediaGalleryItem(row), mediaType: "image" };
  return { ...toMediaVideo(row), mediaType: "video" };
}

export async function getMediaBySlug(slug, { client } = {}) {
  try {
    const contentClient = getContentClient(client);
    const result = await listPublicRecords(contentClient, {
      source: "media_assets",
      filters: [...PUBLISHED_MEDIA_FILTERS(), { column: "slug", value: slug }],
    });
    if (result.success && result.data.length) {
      return serviceSuccess(adaptMediaRow(result.data[0]), "Media item loaded successfully");
    }

    // Also check by database ID in case an ID was passed instead of a slug
    const idResult = await listPublicRecords(contentClient, {
      source: "media_assets",
      filters: [...PUBLISHED_MEDIA_FILTERS(), { column: "id", value: slug }],
    });
    if (idResult.success && idResult.data.length) {
      return serviceSuccess(adaptMediaRow(idResult.data[0]), "Media item loaded successfully");
    }

    return serviceFailure({ code: "NOT_FOUND", message: "Media item was not found." });
  } catch {
    return serviceFailure({ code: "CONTENT_SERVICE_UNAVAILABLE", message: "Media is currently unavailable." });
  }
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Records a real playback view for a published media item, strictly deduplicated
 * by the viewer's client IP and browser User-Agent fingerprint. The same user
 * on the same browser and IP can only ever increment the view count once.
 */
export async function recordMediaView(slugOrId, { clientIp, userAgent, client } = {}) {
  try {
    if (!slugOrId || typeof slugOrId !== "string") {
      return serviceFailure({ code: "VALIDATION_ERROR", message: "Media identifier is required." });
    }

    const safeIp = (clientIp || "unknown").trim();
    const safeUa = (userAgent || "unknown").trim();
    const viewerFingerprint = createHash("sha256")
      .update(`${safeIp}:${safeUa}`)
      .digest("hex")
      .slice(0, 32);

    const supabase = client || createSupabaseServiceRoleClient();

    let query = supabase
      .from("media_assets")
      .select("id, slug, title, body, status, published_at")
      .eq("status", "published");

    if (UUID_REGEX.test(slugOrId)) {
      query = query.or(`id.eq.${slugOrId},slug.eq.${slugOrId}`);
    } else {
      query = query.eq("slug", slugOrId);
    }

    const { data: row, error } = await query.maybeSingle();

    if (error || !row) {
      return serviceFailure({ code: "NOT_FOUND", message: "Media item was not found." });
    }

    const currentBody = row.body && typeof row.body === "object" ? row.body : {};
    const viewers = currentBody.viewers && typeof currentBody.viewers === "object" ? currentBody.viewers : {};

    const currentCount =
      typeof currentBody.view_count === "number" && Number.isFinite(currentBody.view_count)
        ? currentBody.view_count
        : parseBaselineViews(currentBody.views);

    // If this exact browser + IP combination has already been counted, do not increment
    if (viewers[viewerFingerprint]) {
      return serviceSuccess(
        {
          alreadyCounted: true,
          viewCount: currentCount,
          views: formatDisplayViews(currentCount) || currentBody.views || "0 views",
        },
        "View already recorded for this user"
      );
    }

    const newCount = currentCount + 1;
    const newViews = formatDisplayViews(newCount);
    const updatedViewers = {
      ...viewers,
      [viewerFingerprint]: Math.floor(Date.now() / 1000),
    };

    const newBody = {
      ...currentBody,
      view_count: newCount,
      views: newViews,
      viewers: updatedViewers,
    };

    const { error: updateError } = await supabase
      .from("media_assets")
      .update({
        body: newBody,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updateError) {
      return serviceFailure({ code: "UPDATE_FAILED", message: "Failed to record media view." });
    }

    return serviceSuccess(
      {
        alreadyCounted: false,
        viewCount: newCount,
        views: newViews,
      },
      "Media view recorded successfully"
    );
  } catch {
    return serviceFailure({ code: "CONTENT_SERVICE_UNAVAILABLE", message: "Media is currently unavailable." });
  }
}

