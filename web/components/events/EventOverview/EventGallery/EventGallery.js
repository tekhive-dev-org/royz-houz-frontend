import { useState } from "react";
import Image from "next/image";
import { Maximize2 } from "lucide-react";
import EventGalleryLightbox from "./EventGalleryLightbox";
import styles from "./EventGallery.module.css";

const DEFAULT_GALLERY_IMAGES = [
  "/assets/img/events/gallery/gallery-1.jpg",
  "/assets/img/events/gallery/gallery-2.jpg",
  "/assets/img/events/gallery/gallery-3.jpg",
];

/**
 * EventGallery component displaying event highlight recap photos with full-screen lightbox modal.
 */
export function EventGallery({ event }) {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  const images =
    Array.isArray(event?.gallery) && event.gallery.length > 0
      ? event.gallery
      : DEFAULT_GALLERY_IMAGES;

  return (
    <>
      <section className={styles.section} aria-label="Event Gallery">
        {/* Title with Amber Accent Bar */}
        <div className={styles.header}>
          <span className={styles.accentBar} aria-hidden="true" />
          <h2 className={styles.title}>Gallery</h2>
        </div>

        {/* 3-Photo Row */}
        <div className={styles.grid}>
          {images.slice(0, 3).map((imgSrc, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.imageCard}
              onClick={() => setActiveLightboxIndex(idx)}
              aria-label={`Open photo ${idx + 1} in lightbox`}
            >
              <Image
                src={imgSrc}
                alt={`${event?.title || "Event"} highlight photo ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className={styles.image}
              />
              <div className={styles.overlay}>
                <Maximize2 className={`w-6 h-6 sm:w-8 sm:h-8 ${styles.zoomIcon}`} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {activeLightboxIndex !== null && (
        <EventGalleryLightbox
          images={images}
          currentIndex={activeLightboxIndex}
          onClose={() => setActiveLightboxIndex(null)}
          onSelectIndex={(newIndex) => setActiveLightboxIndex(newIndex)}
        />
      )}
    </>
  );
}

export default EventGallery;
