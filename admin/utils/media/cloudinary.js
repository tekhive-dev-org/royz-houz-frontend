const CLOUDINARY_DELIVERY_HOST = "res.cloudinary.com";

export function isCloudinaryDeliveryUrl(value) {
  if (!value || typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === CLOUDINARY_DELIVERY_HOST;
  } catch {
    return false;
  }
}

function normalizeWidth(value) {
  const width = Number(value);
  return Number.isInteger(width) && width >= 1 && width <= 5000 ? width : null;
}

/**
 * Extracts a dynamic image poster frame from any Cloudinary video asset.
 * Changes the extension to .jpg and injects start-offset frame extraction.
 */
export function getCloudinaryVideoPosterUrl(secureUrl, { width = 400, timeOffset = "0" } = {}) {
  if (!isCloudinaryDeliveryUrl(secureUrl)) return "";

  try {
    const url = new URL(secureUrl);
    const segments = url.pathname.split("/");
    const uploadIndex = segments.indexOf("upload");
    if (uploadIndex < 0) return "";

    // Replace video extension with .jpg
    const lastIdx = segments.length - 1;
    segments[lastIdx] = segments[lastIdx].replace(/\.(mp4|webm|mov|m4v|ogv|avi|mkv)$/i, ".jpg");
    if (!segments[lastIdx].endsWith(".jpg")) {
      segments[lastIdx] += ".jpg";
    }

    const normalizedWidth = normalizeWidth(width) || 400;
    const transformation = `so_${timeOffset},w_${normalizedWidth},c_limit,f_auto,q_auto`;
    segments.splice(uploadIndex + 1, 0, transformation);
    url.pathname = segments.join("/");
    return url.toString();
  } catch {
    return "";
  }
}

/**
 * Adds delivery-only Cloudinary transformations to a known secure delivery URL.
 */
export function getResponsiveCloudinaryImageUrl(secureUrl, { width = 400, crop = "limit" } = {}) {
  if (!isCloudinaryDeliveryUrl(secureUrl)) return secureUrl || "";

  // If a video delivery URL was passed, transform it into a video poster frame
  if (/\.(mp4|webm|mov|m4v|ogv|avi|mkv)$/i.test(secureUrl) || secureUrl.includes("/video/upload/")) {
    return getCloudinaryVideoPosterUrl(secureUrl, { width });
  }

  const normalizedWidth = normalizeWidth(width);
  if (!normalizedWidth) return secureUrl;

  try {
    const url = new URL(secureUrl);
    const segments = url.pathname.split("/");
    const uploadIndex = segments.indexOf("upload");
    if (uploadIndex < 0) return secureUrl;

    const transformation = `f_auto,q_auto,c_${crop},w_${normalizedWidth},dpr_auto`;
    segments.splice(uploadIndex + 1, 0, transformation);
    url.pathname = segments.join("/");
    return url.toString();
  } catch {
    return secureUrl || "";
  }
}

/**
 * Intelligently resolves the visual thumbnail URL for any media asset item.
 * Prioritizes custom thumbnail/cover artwork, YouTube thumbnails, Cloudinary images,
 * and Cloudinary video poster frame extraction. Audio assets without custom cover
 * art return "" to prevent rendering .mp3 files as broken images.
 */
export function getMediaThumbnailUrl(item, { width = 400 } = {}) {
  if (!item) return "";

  const body = item.body || {};

  // 1. Explicit thumbnail or cover image in editorial body
  if (body.thumbnail && typeof body.thumbnail === "string" && body.thumbnail.trim()) {
    return body.thumbnail.trim();
  }
  if (body.coverImage && typeof body.coverImage === "string" && body.coverImage.trim()) {
    return body.coverImage.trim();
  }
  if (item.cover_image && typeof item.cover_image === "string" && item.cover_image.trim()) {
    return item.cover_image.trim();
  }
  if (item.thumbnail_url && typeof item.thumbnail_url === "string" && item.thumbnail_url.trim()) {
    return item.thumbnail_url.trim();
  }

  // 2. YouTube thumbnail
  if (item.media_source === "youtube" || item.youtube_thumbnail_url) {
    return item.youtube_thumbnail_url || "";
  }

  // 3. Image assets
  if (item.media_type === "image") {
    return item.secure_url || item.url || "";
  }

  // 4. Video assets on Cloudinary: generate poster frame JPEG
  if (item.media_type === "video" && (item.secure_url || item.url)) {
    const poster = getCloudinaryVideoPosterUrl(item.secure_url || item.url, { width });
    if (poster) return poster;
  }

  // 5. Audio assets or videos without poster should return empty string so placeholder icon renders
  return "";
}
