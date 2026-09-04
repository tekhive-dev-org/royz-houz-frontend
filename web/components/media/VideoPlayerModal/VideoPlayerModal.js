import { useEffect } from "react";
import { X } from "lucide-react";
import { VideoPlayerHero } from "@/components/talents/TalentVideoPlayer/VideoPlayerHero";
import styles from "./VideoPlayerModal.module.css";

/**
 * VideoPlayerModal component providing seamless, fast, optimized video streaming
 * playback matching the primary media player.
 */
export function VideoPlayerModal({ isOpen, onClose, video }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !video) return null;

  const mediaItem = {
    title: video.title || "Stories Beyond the Page",
    subtitle: video.subtitle || "",
    thumbnail: video.coverImage || video.thumbnail || "",
    videoUrl: video.videoUrl || video.url || video.src,
    duration: video.duration || "",
    mediaType: "video",
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close video player"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>

        <div className={styles.videoHeroContainer}>
          <VideoPlayerHero
            media={mediaItem}
            autoPlay={true}
            onEnded={onClose}
          />
        </div>

        {video.title && (
          <div className={styles.videoMeta}>
            <h3 id="video-modal-title" className={styles.videoTitle}>
              {video.title}
            </h3>
            {video.subtitle && (
              <p className={styles.videoSubtitle}>{video.subtitle}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VideoPlayerModal;

