import { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./VideoPlayerModal.module.css";

/**
 * VideoPlayerModal component providing seamless video streaming playback in an atmospheric overlay.
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
          <X className="w-6 h-6 text-white" />
        </button>

        <div className={styles.videoWrapper}>
          <iframe
            src={video.videoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"}
            title={video.title || "Royz House Media Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.iframe}
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
