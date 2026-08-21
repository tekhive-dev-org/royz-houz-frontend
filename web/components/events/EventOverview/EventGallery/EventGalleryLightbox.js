import { useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./EventGalleryLightbox.module.css";

/**
 * EventGalleryLightbox modal component for high-res photo viewing with keyboard and button navigation.
 */
export function EventGalleryLightbox({ images, currentIndex, onClose, onSelectIndex }) {
  const total = images.length;
  const currentImage = images[currentIndex] || images[0];

  const handlePrev = useCallback(
    (e) => {
      e?.stopPropagation();
      onSelectIndex((currentIndex - 1 + total) % total);
    },
    [currentIndex, total, onSelectIndex]
  );

  const handleNext = useCallback(
    (e) => {
      e?.stopPropagation();
      onSelectIndex((currentIndex + 1) % total);
    },
    [currentIndex, total, onSelectIndex]
  );

  // Keyboard navigation & body scroll lock
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, handlePrev, handleNext]);

  return (
    <div
      className={styles.lightboxOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Event gallery photo viewer"
    >
      {/* Top Controls Bar */}
      <div className={styles.topBar} onClick={(e) => e.stopPropagation()}>
        <span className={styles.counterBadge}>
          {currentIndex + 1} / {total}
        </span>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Main Viewport & Navigation Buttons */}
      <div className={styles.mainStage} onClick={(e) => e.stopPropagation()}>
        {total > 1 && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.navPrev}`}
            onClick={handlePrev}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}

        <div className={styles.imageContainer}>
          <Image
            src={currentImage}
            alt={`Gallery photo ${currentIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1200px"
            className={styles.lightboxImage}
          />
        </div>

        {total > 1 && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.navNext}`}
            onClick={handleNext}
            aria-label="Next photo"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Navigation Strip */}
      {total > 1 && (
        <div className={styles.bottomThumbnails} onClick={(e) => e.stopPropagation()}>
          {images.map((imgSrc, idx) => (
            <button
              key={idx}
              type="button"
              className={`${styles.thumbButton} ${
                idx === currentIndex ? styles.thumbActive : styles.thumbInactive
              }`}
              onClick={() => onSelectIndex(idx)}
              aria-label={`Jump to photo ${idx + 1}`}
            >
              <Image
                src={imgSrc}
                alt={`Thumbnail ${idx + 1}`}
                fill
                sizes="56px"
                className={styles.thumbImage}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default EventGalleryLightbox;
