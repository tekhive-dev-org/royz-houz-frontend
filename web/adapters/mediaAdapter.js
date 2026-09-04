import { getCloudinaryVideoPosterUrl, getResponsiveCloudinaryImageUrl, getResponsiveImageSources } from "../utils/media/cloudinary.js";
import { isYouTubeVideoId, normalizeYouTubeUrl } from "../utils/media/youtube.js";
import { getBody } from "./contentAdapter.js";

const MEDIA_IMAGE_FALLBACK = "/assets/img/about/gallery/gallery-4.jpg";

function formatPublishedLabel(value) {
  if (!value) return "";
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return String(value);
  const days = Math.floor((Date.now() - timestamp) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  return new Intl.DateTimeFormat("en-NG", { day: "numeric", month: "short", year: "numeric" }).format(new Date(timestamp));
}

export function parseBaselineViews(value) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (!value || typeof value !== "string") return 0;
  const cleaned = value.trim().toLowerCase().replace(/views?/g, "").trim();
  if (!cleaned) return 0;

  const match = cleaned.match(/^([\d.]+)\s*([kmb])?$/);
  if (!match) {
    const rawNum = parseInt(cleaned.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(rawNum) ? rawNum : 0;
  }
  const num = parseFloat(match[1]);
  if (!Number.isFinite(num)) return 0;
  const multiplier = match[2] === "k" ? 1000 : match[2] === "m" ? 1000000 : match[2] === "b" ? 1000000000 : 1;
  return Math.round(num * multiplier);
}

export function formatDisplayViews(value) {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return typeof value === "string" ? value : "";
  }
  const count = Math.floor(num);
  if (count === 0) return "0 views";
  if (count === 1) return "1 view";
  if (count < 1000) return `${count} views`;
  if (count < 1000000) {
    const k = count / 1000;
    const formatted = k >= 100 ? Math.round(k) : count % 1000 >= 100 ? k.toFixed(1) : Math.round(k);
    return `${formatted}K views`;
  }
  const m = count / 1000000;
  const formatted = m >= 100 ? Math.round(m) : count % 1000000 >= 100000 ? m.toFixed(1) : Math.round(m);
  return `${formatted}M views`;
}

export function formatDisplayDuration(value) {
  if (!value && value !== 0) return "";
  if (typeof value === "string" && value.includes(":")) return value;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return typeof value === "string" ? value : "";
  const totalSeconds = Math.round(num);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatBannerDuration(value) {
  if (!value && value !== 0) return "";
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower.includes("min") || lower.includes("sec") || lower.includes("hr")) {
      return value;
    }
  }
  const num = Number(value);
  if (Number.isFinite(num) && num > 0) {
    const totalMinutes = Math.round(num / 60);
    if (totalMinutes >= 60) {
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;
      return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
    }
    return `${Math.max(1, totalMinutes)} mins`;
  }
  if (typeof value === "string" && value.includes(":")) {
    const parts = value.split(":").map(Number);
    if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
      const mins = parts[0] + Math.round(parts[1] / 60);
      return `${Math.max(1, mins)} mins`;
    }
    if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
      const hours = parts[0];
      const mins = parts[1] + Math.round(parts[2] / 60);
      return mins > 0 ? `${hours} hr ${mins} mins` : `${hours} hr`;
    }
  }
  return String(value);
}

function getYouTubeMetadata(row) {
  if (row.media_source !== "youtube") return null;

  try {
    return normalizeYouTubeUrl(row.youtube_original_url);
  } catch {
    if (!isYouTubeVideoId(row.youtube_video_id)) return null;
    return {
      embedUrl: `https://www.youtube.com/embed/${row.youtube_video_id}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${row.youtube_video_id}/hqdefault.jpg`,
    };
  }
}

function getSafeMediaUrl(row) {
  const youtube = getYouTubeMetadata(row);
  if (youtube) return youtube.embedUrl;
  return row.secure_url || row.url || "";
}

function getImageUrl(row, body, field) {
  const bodyValue = body[field];
  if (bodyValue) return bodyValue;
  return row.media_type === "image"
    ? getResponsiveCloudinaryImageUrl(row.secure_url || row.url, { width: 1200 }) || MEDIA_IMAGE_FALLBACK
    : MEDIA_IMAGE_FALLBACK;
}

/**
 * Safe public projection for shared media records. It excludes source-provider
 * credentials/internal metadata while retaining the URLs and fields existing
 * public components need.
 */
export function toPublicMediaAsset(row) {
  const body = getBody(row);
  const youtube = getYouTubeMetadata(row);
  const mediaUrl = getSafeMediaUrl(row);
  const imageUrl = row.media_type === "image" ? getImageUrl(row, body, "image") : "";
  const videoPoster =
    row.media_type === "video" && row.secure_url ? getCloudinaryVideoPosterUrl(row.secure_url, { width: 768 }) : "";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary || "",
    sourceType: row.media_source,
    mediaType: row.media_type,
    url: mediaUrl,
    thumbnail:
      body.thumbnail ||
      body.coverImage ||
      youtube?.thumbnailUrl ||
      row.youtube_thumbnail_url ||
      imageUrl ||
      videoPoster ||
      MEDIA_IMAGE_FALLBACK,
    altText: row.alt_text || body.alt || row.title,
    caption: row.caption || "",
    width: row.width || null,
    height: row.height || null,
    duration: formatDisplayDuration(row.duration_seconds || body.duration),
    featured: row.featured === true,
    category: body.category || body.section || "",
    responsiveImages:
      row.media_source === "cloudinary" && row.media_type === "image"
        ? getResponsiveImageSources(row.secure_url || row.url)
        : [],
    publishedAt: row.published_at || null,
  };
}

export function toMediaVideo(row) {
  const body = getBody(row);
  const youtube = getYouTubeMetadata(row);
  const viewCount = typeof body.view_count === "number" ? body.view_count : parseBaselineViews(body.views);
  const views = typeof body.view_count === "number" ? formatDisplayViews(body.view_count) : (body.views || "");
  return {
    ...body,
    id: body.sourceConstantId || row.id,
    databaseId: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.summary || body.subtitle || "",
    description: body.description || row.summary || "",
    duration: formatDisplayDuration(body.duration || row.duration_seconds),
    thumbnail:
      body.thumbnail ||
      youtube?.thumbnailUrl ||
      row.youtube_thumbnail_url ||
      getResponsiveCloudinaryImageUrl(row.secure_url || row.url, { width: 768 }) ||
      MEDIA_IMAGE_FALLBACK,
    author: body.author || { name: "Royz Houz", avatar: "" },
    host: body.host || body.author?.name || "Royz Houz",
    views,
    viewCount,
    publishedAt: formatPublishedLabel(body.publishedAt || row.published_at),
    featured: row.featured === true,
    videoUrl: getSafeMediaUrl(row),
  };
}

export function toMediaTrack(row) {
  const body = getBody(row);
  const youtube = getYouTubeMetadata(row);
  const viewCount = typeof body.view_count === "number" ? body.view_count : parseBaselineViews(body.views);
  const views = typeof body.view_count === "number" ? formatDisplayViews(body.view_count) : (body.views || "");
  return {
    ...body,
    id: body.sourceConstantId || row.id,
    databaseId: row.id,
    slug: row.slug,
    title: row.title,
    genre: body.genre || "",
    artist: body.artist || "",
    duration: formatDisplayDuration(body.duration || row.duration_seconds),
    coverImage:
      body.coverImage ||
      youtube?.thumbnailUrl ||
      row.youtube_thumbnail_url ||
      getResponsiveCloudinaryImageUrl(row.secure_url || row.url, { width: 768 }) ||
      MEDIA_IMAGE_FALLBACK,
    views,
    viewCount,
    audioUrl: getSafeMediaUrl(row),
  };
}

export function toMediaGalleryItem(row) {
  const body = getBody(row);
  return {
    ...body,
    id: body.sourceConstantId || row.id,
    databaseId: row.id,
    slug: row.slug,
    title: row.title,
    image: getImageUrl(row, body, "image"),
    alt: row.alt_text || body.alt || row.title,
    size: body.size || "short",
    width: row.width || null,
    height: row.height || null,
  };
}
