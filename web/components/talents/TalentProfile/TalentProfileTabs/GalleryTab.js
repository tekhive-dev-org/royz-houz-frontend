import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "./TalentProfileTabs.module.css";

/**
 * GalleryTab rendering a responsive grid of photography with interactive full-screen Lightbox.
 */
export function GalleryTab({ talent }) {
  const images = talent?.galleryImages || [
    talent?.coverImage || "/assets/img/talents/producer-hero.jpg",
    talent?.image || "/assets/img/talents/julius.jpg",
    "/assets/img/talents/studio.jpg",
    "/assets/img/talents/headphones.jpg",
    "/assets/img/talents/kofi.jpg",
    "/assets/img/talents/fatima.jpg",
    "/assets/img/talents/amara.jpg",
    "/assets/img/talents/blessing.jpg",
  ];

  const [selectedIndex, setSelectedIndex] = useState(null);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (selectedIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

  return (
    <div role="tabpanel" aria-label="Talent Gallery">
      {/* 3-Column Gallery Grid */}
      <div className={styles.galleryGrid}>
        {images.map((src, idx) => (
          <div
            key={idx}
            className={styles.galleryItem}
            onClick={() => setSelectedIndex(idx)}
            role="button"
            tabIndex={0}
            aria-label={`View photo ${idx + 1} of ${images.length}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedIndex(idx);
              }
            }}
          >
            <Image
              src={src}
              alt={`${talent?.name || "Talent"} Gallery photo ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className="object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className={styles.lightboxBackdrop}
          onClick={handleClose}
          role="dialog"
          aria-modal="true"
          aria-label="Gallery Image Viewer"
        >
          {/* Close Button */}
          <button
            type="button"
            className={styles.lightboxCloseBtn}
            onClick={handleClose}
            aria-label="Close image viewer"
          >
            <X className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* Previous Button */}
          <button
            type="button"
            className={`${styles.lightboxNavBtn} ${styles.lightboxPrevBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous photo"
          >
            <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>

          {/* Image Container */}
          <div
            className={styles.lightboxImageWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedIndex]}
              alt={`${talent?.name || "Talent"} photo ${selectedIndex + 1}`}
              fill
              priority
              sizes="90vw"
              className="object-contain object-center"
            />
          </div>

          {/* Next Button */}
          <button
            type="button"
            className={`${styles.lightboxNavBtn} ${styles.lightboxNextBtn}`}
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next photo"
          >
            <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
          </button>
        </div>
      )}
    </div>
  );
}

export default GalleryTab;
