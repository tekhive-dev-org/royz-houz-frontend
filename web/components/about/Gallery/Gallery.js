import { ABOUT_GALLERY_COLUMNS } from "@/constants/about";
import { GalleryItem } from "./GalleryItem";
import styles from "./Gallery.module.css";

/**
 * Gallery section displaying memorable cultural, creative, and performance moments in masonry layout.
 */
export function Gallery() {
  return (
    <section className={styles.section} id="our-gallery">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.badgeRow}>
            <span className={styles.badgeLine} aria-hidden="true" />
            <span>OUR GALLERY</span>
            <span className={styles.badgeLine} aria-hidden="true" />
          </div>

          <h2 className={styles.headline}>Moments That Matters</h2>

          <p className={styles.subtitle}>
            A visual journey celebrating the people, stories and unforgettable
            moments that continue to shape Royz Houz.
          </p>
        </div>

        {/* 3-Column Masonry Grid */}
        <div className={styles.galleryGrid}>
          {ABOUT_GALLERY_COLUMNS.map((column, colIdx) => (
            <div key={colIdx} className={styles.masonryColumn}>
              {column.map((item) => (
                <GalleryItem key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
