import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook to track genuine user media playback interactions.
 * Ensures the view count is recorded only once per user browser & IP,
 * preventing duplicate increments from pauses, resumes, scrubs, or replays.
 */
export function useMediaViewTracker(media) {
  const [liveViews, setLiveViews] = useState(media?.views || "");
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    setLiveViews(media?.views || "");
    hasRecordedRef.current = false;
  }, [media?.id, media?.databaseId, media?.slug, media?.views]);

  const recordPlaybackView = useCallback(async () => {
    if (!media || hasRecordedRef.current) return;

    const mediaId = media.databaseId || media.id || media.slug;
    if (!mediaId) return;

    const storageKey = `royz_viewed_media_${mediaId}`;

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        if (window.localStorage.getItem(storageKey)) {
          hasRecordedRef.current = true;
          return;
        }
        window.localStorage.setItem(storageKey, Date.now().toString());
      }
    } catch {
      // Fallback gracefully if localStorage is unavailable
    }

    hasRecordedRef.current = true;

    try {
      const targetSlug = media.slug || media.databaseId || media.id;
      const res = await fetch(`/api/media/${encodeURIComponent(targetSlug)}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) return;

      const payload = await res.json();
      if (payload?.success && payload.data?.views) {
        setLiveViews(payload.data.views);
      }
    } catch {
      // Non-blocking network failure
    }
  }, [media]);

  return {
    views: liveViews,
    recordPlaybackView,
  };
}
