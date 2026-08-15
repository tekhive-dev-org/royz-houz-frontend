import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { MediaPagination } from "../MediaPagination/MediaPagination";
import styles from "./MediaGallery.module.css";

const SIZE_STYLES = {
  short: styles.sizeShort,
  tall: styles.sizeTall,
  extraTall: styles.sizeExtraTall,
};

/**
 * MediaGallery component presenting "Through The Lens" in the masonry grid,
 * supporting interactive talent-style full-screen Lightbox photo viewer and paginated catalog view.
 */
export function MediaGallery({
  photos,
  onViewAll,
  isFullView = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(9);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Flat list of photos for clean pagination slicing and lightbox viewing
  const flatPhotos = Array.isArray(photos?.[0]) ? photos.flat() : (photos || []);
  const totalPages = Math.max(1, Math.ceil(flatPhotos.length / perPage));

  const currentPhotos = isFullView
    ? flatPhotos.slice((currentPage - 1) * perPage, currentPage * perPage)
    : flatPhotos.slice(0, 6);

  // Distribute into 3 masonry columns
  const columns = [
    currentPhotos.filter((_, idx) => idx % 3 === 0),
    currentPhotos.filter((_, idx) => idx % 3 === 1),
    currentPhotos.filter((_, idx) => idx % 3 === 2),
  ];

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : currentPhotos.length - 1));
  }, [currentPhotos.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev < currentPhotos.length - 1 ? prev + 1 : 0));
  }, [currentPhotos.length]);

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  // Keyboard navigation for Lightbox
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedIndex(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePerPageChange = (count) => {
    setPerPage(count);
    setCurrentPage(1);
    setSelectedIndex(null);
  };

  if (!photos || photos.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="gallery-heading">
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleRow}>
            <div className={styles.accentBar} aria-hidden="true" />
            <h2 id="gallery-heading" className={styles.title}>
              Through The Lens
            </h2>
          </div>

          {!isFullView && (
            <Link
              href="/media?tab=gallery"
              onClick={(e) => {
                if (onViewAll) {
                  e.preventDefault();
                  onViewAll("gallery");
                }
              }}
              className={styles.viewAllLink}
            >
              <span>View all photos</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <p className={styles.subtitle}>
          {isFullView
            ? "Capturing moments that tell our stories"
            : "Visual stories capturing moments from across Nigeria."}
        </p>
      </div>

      {/* 3-Column Masonry Grid (matching About Us Gallery) */}
      <div className={styles.galleryGrid}>
        {columns.map((column, colIdx) => (
          <div key={colIdx} className={styles.masonryColumn}>
            {column.map((item) => {
              const sizeClass = SIZE_STYLES[item.size] || styles.sizeShort;
              const itemGlobalIndex = currentPhotos.findIndex((p) => p.id === item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(itemGlobalIndex >= 0 ? itemGlobalIndex : 0)}
                  className={`${styles.galleryItem} ${sizeClass}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`View photo: ${item.title || item.alt}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedIndex(itemGlobalIndex >= 0 ? itemGlobalIndex : 0);
                    }
                  }}
                >
                  <Image
                    src={item.image}
                    alt={item.alt || item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={styles.galleryImage}
                  />
                  <div className={styles.overlay} aria-hidden="true" />
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Pagination (visible when in full catalog view) */}
      {isFullView && (
        <MediaPagination
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}

      {/* Interactive Full-Screen Lightbox Modal (matching Talents gallery) */}
      {selectedIndex !== null && currentPhotos[selectedIndex] && (
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

          {/* Image Container with Caption */}
          <div
            className={styles.lightboxImageWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentPhotos[selectedIndex].image}
              alt={currentPhotos[selectedIndex].alt || currentPhotos[selectedIndex].title}
              fill
              priority
              sizes="90vw"
              className="object-contain object-center"
            />

            {/* Bottom Caption Overlay */}
            <div className={styles.lightboxFooter}>
              <span className={styles.lightboxTitle}>
                {currentPhotos[selectedIndex].title || currentPhotos[selectedIndex].alt}
              </span>
              <span className={styles.lightboxCounter}>
                {selectedIndex + 1} / {currentPhotos.length}
              </span>
            </div>
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
    </section>
  );
}

export default MediaGallery;
