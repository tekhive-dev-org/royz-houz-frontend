import Image from "next/image";
import styles from "./ProductGallery.module.css";

/**
 * ProductGallery Component
 * Displays vertical stack of high-resolution product photography angles matching Figma design.
 */
export function ProductGallery({ images = [], productTitle = "Product" }) {
  return (
    <div className={styles.galleryContainer} aria-label={`${productTitle} Image Gallery`}>
      {images.map((img, idx) => (
        <div key={idx} className={styles.imageCard}>
          <div className={styles.imageWrapper}>
            <Image
              src={img}
              alt={`${productTitle} angle ${idx + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={styles.productPhoto}
              priority={idx === 0}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductGallery;
