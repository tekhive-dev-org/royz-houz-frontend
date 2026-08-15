import Image from "next/image";
import styles from "./EventGallery.module.css";

/**
 * EventGallery component displaying a 6-image photo highlight grid.
 */
export function EventGallery({ event }) {
  const images =
    event?.gallery || [
      "/assets/img/events/events-hero-bg.png",
      "/assets/img/about/gallery/gallery-1.jpg",
      "/assets/img/talents/headphones.jpg",
      "/assets/img/events/event2.jpg",
      "/assets/img/about/moments.jpg",
      "/assets/img/events/event3.jpg",
    ];

  return (
    <section className={styles.section} aria-label="Event Gallery">
      {/* Title with Amber Accent Bar */}
      <div className={styles.header}>
        <span className={styles.accentBar} aria-hidden="true" />
        <h2 className={styles.title}>Gallery</h2>
      </div>

      {/* 2x3 Grid */}
      <div className={styles.grid}>
        {images.slice(0, 6).map((imgSrc, idx) => (
          <div key={idx} className={`${styles.imageCard} group`}>
            <Image
              src={imgSrc}
              alt={`${event?.title || "Event"} highlight ${idx + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, 33vw"
              className={styles.image}
            />
            <div className={styles.overlay} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventGallery;
