import Image from "next/image";
import styles from "./Gallery.module.css";

const SIZE_STYLES = {
  short: styles.sizeShort,
  tall: styles.sizeTall,
  extraTall: styles.sizeExtraTall,
};

/**
 * GalleryItem component rendering a single photo in the masonry grid.
 */
export function GalleryItem({ item }) {
  const sizeClass = SIZE_STYLES[item.size] || styles.sizeShort;

  return (
    <div className={`${styles.galleryItem} ${sizeClass}`}>
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
}

export default GalleryItem;
