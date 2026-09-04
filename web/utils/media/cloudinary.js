const CLOUDINARY_DELIVERY_HOST = "res.cloudinary.com";

function isCloudinaryDeliveryUrl(value) {
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
export function getCloudinaryVideoPosterUrl(secureUrl, { width = 768, timeOffset = "0" } = {}) {
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

    const normalizedWidth = normalizeWidth(width) || 768;
    const transformation = `so_${timeOffset},w_${normalizedWidth},c_limit,f_auto,q_auto`;
    segments.splice(uploadIndex + 1, 0, transformation);
    url.pathname = segments.join("/");
    return url.toString();
  } catch {
    return "";
  }
}

/**
 * Adds delivery-only Cloudinary transformations to a known secure delivery
 * URL. The original stored URL is never overwritten and non-Cloudinary URLs
 * are returned unchanged so current local/external fallback assets remain safe.
 */
export function getResponsiveCloudinaryImageUrl(secureUrl, { width, crop = "limit" } = {}) {
  if (!isCloudinaryDeliveryUrl(secureUrl)) return secureUrl || "";

  // If a video delivery URL was passed, transform it into a video poster frame
  if (/\.(mp4|webm|mov|m4v|ogv|avi|mkv)$/i.test(secureUrl) || secureUrl.includes("/video/upload/")) {
    return getCloudinaryVideoPosterUrl(secureUrl, { width: width || 768 });
  }

  const normalizedWidth = normalizeWidth(width);
  if (!normalizedWidth) return secureUrl;

  const url = new URL(secureUrl);
  const segments = url.pathname.split("/");
  const uploadIndex = segments.indexOf("upload");
  if (uploadIndex < 0) return secureUrl;

  const transformation = `f_auto,q_auto,c_${crop},w_${normalizedWidth},dpr_auto`;
  segments.splice(uploadIndex + 1, 0, transformation);
  url.pathname = segments.join("/");
  return url.toString();
}

export function getResponsiveImageSources(secureUrl, widths = [480, 768, 1200]) {
  return widths
    .map(normalizeWidth)
    .filter(Boolean)
    .map((width) => ({ width, url: getResponsiveCloudinaryImageUrl(secureUrl, { width }) }));
}

/**
 * Transforms Cloudinary video delivery URLs for fast-start, responsive streaming:
 * - f_auto: automatically selects optimal video codec/container (WebM/VP9, MP4/H.264).
 * - q_auto: automatically optimizes bitrate for fast progressive streaming without stalling.
 * - vc_auto: automatic video codec selection.
 * Moves the moov atom to the front for instant zero-delay playback start.
 */
export function getOptimizedCloudinaryVideoUrl(secureUrl, { quality = "auto" } = {}) {
  if (!isCloudinaryDeliveryUrl(secureUrl)) return secureUrl || "";

  try {
    const url = new URL(secureUrl);
    const segments = url.pathname.split("/");
    const uploadIndex = segments.indexOf("upload");
    if (uploadIndex < 0) return secureUrl;

    // Avoid duplicate transformations if already present
    if (segments[uploadIndex + 1]?.includes("q_") || segments[uploadIndex + 1]?.includes("f_auto")) {
      return secureUrl;
    }

    const transformation = `f_auto,q_${quality},vc_auto`;
    segments.splice(uploadIndex + 1, 0, transformation);
    url.pathname = segments.join("/");
    return url.toString();
  } catch {
    return secureUrl || "";
  }
}
