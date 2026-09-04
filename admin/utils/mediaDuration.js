/**
 * Utility for client-side media duration probing and formatting.
 */

export function detectMediaDuration(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    try {
      const isVideo = file.type?.startsWith("video/") || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
      const isAudio = file.type?.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name);
      if (!isVideo && !isAudio) return resolve(null);

      const element = document.createElement(isVideo ? "video" : "audio");
      element.preload = "metadata";
      const objectUrl = URL.createObjectURL(file);
      element.src = objectUrl;

      const cleanup = () => {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch {
          // ignore
        }
      };

      element.onloadedmetadata = () => {
        const secs = element.duration;
        cleanup();
        if (Number.isFinite(secs) && secs > 0) {
          resolve(secs);
        } else {
          resolve(null);
        }
      };

      element.onerror = () => {
        cleanup();
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export function formatSecondsToTime(seconds) {
  if (!seconds || !Number.isFinite(seconds) || seconds <= 0) return "";
  const totalSecs = Math.round(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function parseDurationToSeconds(str) {
  if (!str) return null;
  const clean = String(str).trim();
  if (clean.includes(":")) {
    const parts = clean.split(":").map(Number);
    if (parts.length === 3) {
      return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
    }
    if (parts.length === 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }
  }
  const num = Number(clean);
  return Number.isFinite(num) && num > 0 ? num : null;
}
