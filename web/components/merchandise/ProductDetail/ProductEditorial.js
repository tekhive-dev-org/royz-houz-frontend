import Image from "next/image";
import styles from "./ProductEditorial.module.css";

/**
 * ProductEditorial Component
 * Editorial lookbook showcase displaying model lifestyle photography.
 */
export function ProductEditorial({
  title = "Elegant Line",
  subtitle = "EXPLORE OUR EXCLUSIVE EDITORIAL",
  images = [
    "/assets/img/merchandise/prod-brown-blouse.jpg",
    "/assets/img/merchandise/pdp-blouse-detail.jpg",
  ],
}) {
  return (
    <section className={styles.section} aria-label="Editorial Showcase">
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>

      <div className={styles.grid}>
        {images.map((img, idx) => (
          <div key={idx} className={styles.editorialCard}>
            <div className={styles.imageWrap}>
              <Image
                src={img}
                alt={`Editorial look ${idx + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className={styles.editorialImg}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProductEditorial;
