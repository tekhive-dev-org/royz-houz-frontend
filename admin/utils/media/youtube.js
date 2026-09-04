const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;
const YOUTUBE_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com"]);

function invalidYouTubeUrl() {
  throw new Error("Enter a valid YouTube watch, short, or youtu.be URL.");
}

function getVideoIdFromUrl(url) {
  const host = url.hostname.toLowerCase();
  const pathParts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be") {
    if (pathParts.length !== 1) invalidYouTubeUrl();
    return pathParts[0];
  }

  if (!YOUTUBE_HOSTS.has(host)) invalidYouTubeUrl();

  if (url.pathname === "/watch") return url.searchParams.get("v");
  if (pathParts.length === 2 && pathParts[0] === "shorts") return pathParts[1];

  invalidYouTubeUrl();
}

/**
 * Normalizes supported public YouTube URLs into a safe media descriptor.
 * Arbitrary iframe markup and non-YouTube hosts are rejected.
 */
export function normalizeYouTubeUrl(value) {
  if (typeof value !== "string" || !value.trim()) invalidYouTubeUrl();

  let parsedUrl;
  try {
    parsedUrl = new URL(value.trim());
  } catch {
    invalidYouTubeUrl();
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") invalidYouTubeUrl();
  if (parsedUrl.username || parsedUrl.password || parsedUrl.port) invalidYouTubeUrl();

  const videoId = getVideoIdFromUrl(parsedUrl);
  if (!YOUTUBE_VIDEO_ID_PATTERN.test(videoId || "")) invalidYouTubeUrl();

  return {
    originalUrl: parsedUrl.toString(),
    videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
  };
}

export function isYouTubeVideoId(value) {
  return typeof value === "string" && YOUTUBE_VIDEO_ID_PATTERN.test(value);
}
