import { ABOUT_GALLERY_COLUMNS } from "@/constants/about";
import { GALLERY_CONTENT } from "@/constants/aboutContent";
import { GalleryItem } from "./GalleryItem";
import styles from "./Gallery.module.css";

/**
 * Gallery section displaying memorable cultural, creative, and performance moments in masonry layout.
 */
export function Gallery({
  content = GALLERY_CONTENT,
  columns = ABOUT_GALLERY_COLUMNS,
} = {}) {
  const sectionContent = { ...GALLERY_CONTENT, ...(content || {}) };
  const galleryColumns = Array.isArray(columns) ? columns : ABOUT_GALLERY_COLUMNS;

  return (
    <section className={styles.section} id="our-gallery">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.badgeRow}>
            <span className={styles.badgeLine} aria-hidden="true" />
            <span>{sectionContent.badge}</span>
            <span className={styles.badgeLine} aria-hidden="true" />
          </div>

          <h2 className={styles.headline}>{sectionContent.headline}</h2>

          <p className={styles.subtitle}>
            {sectionContent.subtitle}
          </p>
        </div>

        {/* 3-Column Masonry Grid */}
        <div className={styles.galleryGrid}>
          {galleryColumns.map((column, colIdx) => (
            <div key={colIdx} className={styles.masonryColumn}>
              {(Array.isArray(column) ? column : []).map((item, itemIdx) => (
                <GalleryItem key={item?.id || itemIdx} item={item} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;
