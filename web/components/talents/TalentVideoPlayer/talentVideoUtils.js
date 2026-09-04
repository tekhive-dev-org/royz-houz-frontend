import { normalizeYouTubeUrl } from "@/utils/media/youtube";

function normalizeMediaId(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function normalizeTalentVideoSlug(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
}

export function parseMediaDurationToSeconds(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) && value > 0 ? value : 0;
  const str = String(value).trim();
  if (str.includes(":")) {
    const parts = str.split(":").map(Number);
    if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
      return parts[0] * 60 + parts[1];
    }
  }
  if (str.toLowerCase().includes("hr")) {
    const hrMatch = str.match(/(\d+)\s*hr/i);
    const minMatch = str.match(/(\d+)\s*min/i);
    const hrs = hrMatch ? parseInt(hrMatch[1], 10) : 0;
    const mins = minMatch ? parseInt(minMatch[1], 10) : 0;
    return hrs * 3600 + mins * 60;
  }
  if (str.toLowerCase().includes("min")) {
    const match = str.match(/(\d+)/);
    if (match) return parseInt(match[1], 10) * 60;
  }
  const num = Number(str);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

export function getTalentVideos(talent) {
  const videos = Array.isArray(talent?.videos) ? talent.videos : [];
  const candidates = videos;
  const seenIds = new Set();
  const seenSlugs = new Set();

  return candidates.reduce((result, video, index) => {
    const id = normalizeMediaId(video?.id);
    if (!id || seenIds.has(id)) return result;
    seenIds.add(id);

    const baseSlug =
      normalizeTalentVideoSlug(video?.slug) ||
      normalizeTalentVideoSlug(video?.title) ||
      normalizeTalentVideoSlug(id) ||
      `video-${index + 1}`;
    let slug = baseSlug;
    let suffix = 2;
    while (seenSlugs.has(slug)) {
      const suffixText = `-${suffix}`;
      slug = `${baseSlug.slice(0, 160 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }
    seenSlugs.add(slug);
    result.push({ ...video, id, slug, mediaType: "video" });
    return result;
  }, []);
}

export function getTalentMusicTracks(talent) {
  const tracks = Array.isArray(talent?.musicTracks) ? talent.musicTracks : [];
  const seenIds = new Set();
  const seenSlugs = new Set();

  return tracks.reduce((result, track, index) => {
    const id = normalizeMediaId(track?.id);
    if (!id || seenIds.has(id)) return result;
    seenIds.add(id);

    const baseSlug =
      normalizeTalentVideoSlug(track?.slug) ||
      normalizeTalentVideoSlug(track?.title) ||
      normalizeTalentVideoSlug(id) ||
      `track-${index + 1}`;
    let slug = baseSlug;
    let suffix = 2;
    while (seenSlugs.has(slug)) {
      const suffixText = `-${suffix}`;
      slug = `${baseSlug.slice(0, 160 - suffixText.length)}${suffixText}`;
      suffix += 1;
    }
    seenSlugs.add(slug);
    result.push({ ...track, id, slug, mediaType: "music" });
    return result;
  }, []);
}

export function getTalentMediaItems(talent) {
  return [...getTalentVideos(talent), ...getTalentMusicTracks(talent)];
}

export function partitionTalentVideoQueue(videos, activeVideoId) {
  const videoList = Array.isArray(videos) ? videos : [];
  const requestedId = normalizeMediaId(activeVideoId);
  const currentIndex = videoList.findIndex(
    (video) =>
      requestedId &&
      (normalizeMediaId(video.id) === requestedId ||
        String(video.title || "").toLowerCase() === requestedId.toLowerCase())
  );

  return {
    currentVideo: currentIndex >= 0 ? videoList[currentIndex] : null,
    upcomingVideos:
      currentIndex >= 0
        ? [...videoList.slice(currentIndex + 1), ...videoList.slice(0, currentIndex)]
        : videoList,
  };
}

export function buildTalentVideoQueue(talent, currentVideo) {
  const videos = getTalentVideos(talent);
  const currentId = normalizeMediaId(currentVideo?.id);
  if (!currentId) return videos;
  if (videos.some((video) => normalizeMediaId(video.id) === currentId)) return videos;
  return [currentVideo, ...videos];
}

export function getTalentVideoRouteKey(video) {
  return normalizeTalentVideoSlug(video?.slug) || normalizeMediaId(video?.id);
}

export function getTalentVideoPath(talent, video) {
  const talentSlug = normalizeMediaId(talent?.slug || talent?.id);
  const videoSlug = getTalentVideoRouteKey(video);
  if (!talentSlug || !videoSlug) return null;
  return `/talents/${encodeURIComponent(talentSlug)}/video/${encodeURIComponent(videoSlug)}`;
}

export function findTalentVideo(talent, videoSlugOrId) {
  const requestedValue = normalizeMediaId(videoSlugOrId);
  if (!requestedValue) return null;

  return (
    getTalentVideos(talent).find(
      (video) => video.slug === requestedValue || normalizeMediaId(video.id) === requestedValue
    ) || null
  );
}

export function buildTalentMediaQueue(talent, currentMedia) {
  const items = getTalentMediaItems(talent);
  const currentId = normalizeMediaId(currentMedia?.id);
  if (!currentId) return items;
  if (items.some((item) => normalizeMediaId(item.id) === currentId)) return items;
  return [{ ...currentMedia, mediaType: currentMedia?.mediaType || "video" }, ...items];
}

export function getTalentMediaPath(talent, item) {
  const talentSlug = normalizeMediaId(talent?.slug || talent?.id);
  const mediaSlug = normalizeTalentVideoSlug(item?.slug) || normalizeMediaId(item?.id);
  if (!talentSlug || !mediaSlug) return null;
  if (talentSlug === "media" || talent?.isMediaHub) {
    return `/media/watch/${encodeURIComponent(mediaSlug)}`;
  }
  return `/talents/${encodeURIComponent(talentSlug)}/media/${encodeURIComponent(mediaSlug)}`;
}

export function findTalentMedia(talent, mediaSlugOrId) {
  const requestedValue = normalizeMediaId(mediaSlugOrId);
  if (!requestedValue) return null;

  return (
    getTalentMediaItems(talent).find(
      (item) => item.slug === requestedValue || normalizeMediaId(item.id) === requestedValue
    ) || null
  );
}

const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|ogg|ogv|mov|m4v)(?:\?.*)?$/i;

function extractYouTubeId(urlStr) {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1).split("/")[0];
      if (/^[A-Za-z0-9_-]{11}$/.test(id)) return id;
    }
    if (host.includes("youtube.com")) {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v");
        if (id && /^[A-Za-z0-9_-]{11}$/.test(id)) return id;
      }
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "v" || parts[0] === "live") {
        if (/^[A-Za-z0-9_-]{11}$/.test(parts[1] || "")) return parts[1];
      }
    }
  } catch {}
  return null;
}

function extractVimeoId(urlStr) {
  const match = String(urlStr || "").match(/(?:vimeo\.com\/(?:video\/)?)([0-9]+)/i);
  return match ? match[1] : null;
}

export function getSafeVideoSource(value) {
  if (typeof value !== "string" || !value.trim() || value.includes("<")) {
    return null;
  }

  const trimmedValue = value.trim();

  try {
    const youtube = normalizeYouTubeUrl(trimmedValue);
    return { type: "youtube", url: youtube.embedUrl, videoId: youtube.videoId };
  } catch {
    const ytId = extractYouTubeId(trimmedValue);
    if (ytId) {
      return { type: "youtube", url: `https://www.youtube.com/embed/${ytId}`, videoId: ytId };
    }
  }

  const vimeoId = extractVimeoId(trimmedValue);
  if (vimeoId) {
    return {
      type: "vimeo",
      url: `https://player.vimeo.com/video/${vimeoId}?autoplay=1`,
      videoId: vimeoId,
    };
  }

  try {
    const parsedUrl = new URL(trimmedValue);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return null;
    if (parsedUrl.username || parsedUrl.password) return null;

    const isCloudinaryVideo =
      parsedUrl.hostname === "res.cloudinary.com" &&
      /^\/[^/]+\/video\/upload\//.test(parsedUrl.pathname);

    const isDirectVideoFile = VIDEO_EXTENSION_PATTERN.test(parsedUrl.pathname);

    if (isCloudinaryVideo || isDirectVideoFile) {
      return { type: "cloudinary", url: parsedUrl.toString() };
    }

    if (parsedUrl.pathname.includes("/embed/")) {
      return { type: "iframe", url: parsedUrl.toString() };
    }
  } catch {
    return null;
  }

  return null;
}

const AUDIO_EXTENSION_PATTERN = /\.(mp3|m4a|wav|aac|ogg|oga|flac)(?:\?.*)?$/i;

function isCloudinaryAudioUrl(parsedUrl) {
  return (
    parsedUrl.protocol === "https:" &&
    parsedUrl.hostname === "res.cloudinary.com" &&
    !parsedUrl.username &&
    !parsedUrl.password &&
    !parsedUrl.port &&
    /^\/[^/]+\/video\/upload\//.test(parsedUrl.pathname) &&
    AUDIO_EXTENSION_PATTERN.test(parsedUrl.pathname)
  );
}

export function getSafeAudioSource(value) {
  if (typeof value !== "string" || !value.trim() || value.includes("<")) {
    return null;
  }

  const trimmedValue = value.trim();

  try {
    const parsedUrl = new URL(trimmedValue);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") return null;
    if (parsedUrl.username || parsedUrl.password) return null;

    if (isCloudinaryAudioUrl(parsedUrl) || AUDIO_EXTENSION_PATTERN.test(parsedUrl.pathname)) {
      return {
        type: "audio",
        url: parsedUrl.toString(),
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function getSafeMediaSource(value, mediaType) {
  return mediaType === "music" ? getSafeAudioSource(value) : getSafeVideoSource(value);
}
