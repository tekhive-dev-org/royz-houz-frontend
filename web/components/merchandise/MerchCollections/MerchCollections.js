import Image from "next/image";
import styles from "./MerchCollections.module.css";

const COLLECTIONS = [
  {
    id: "heels",
    tag: "HOT PIECE",
    title: "WOMEN'S HEELS",
    subtitle: "Pair of Elegant Pointed-Toe High Heels, with a Sharp Pointed Toe",
    image: "/assets/img/merchandise/collection-pink-heels.jpg",
  },
  {
    id: "bags",
    title: "WOMEN'S HANDBAGS",
    subtitle: "Exclusive new pieces",
    image: "/assets/img/merchandise/collection-pink-bag.jpg",
  },
  {
    id: "shoes",
    title: "CASUAL SNEAKERS",
    subtitle: "",
    image: "/assets/img/merchandise/collection-men-sneakers.jpg",
  },
  {
    id: "watches",
    title: "MEN'S QUARTZ WATCH",
    subtitle: "Men's Elegant Quartz Wristwatch with Date Display",
    image: "/assets/img/merchandise/collection-luxury-watch.jpg",
  },
  {
    id: "footwear",
    title: "WOMEN'S HEEL SANDALS",
    subtitle: "Give the moment",
    image: "/assets/img/merchandise/collection-black-heels.jpg",
  },
];

/**
 * MerchCollections Component
 * Displays the 5-category clean luxury mosaic matching the Figma design.
 */
export function MerchCollections({ onSelectCategory }) {
  const featured = COLLECTIONS[0];
  const middleCols = COLLECTIONS.slice(1, 3);
  const rightCols = COLLECTIONS.slice(3, 5);

  return (
    <section className={styles.section} id="collections" aria-label="Collections">
      <div className={styles.container}>
        {/* ── Section Header ──────────────────────────── */}
        <div className={styles.headerRow}>
          <div className={styles.headerLeft}>
            <div className={styles.tagWrapper}>
              <span className={styles.tagLine} />
              <span className={styles.tagText}>BROWSE</span>
            </div>
            <h2 className={styles.heading}>Explore Our Collections</h2>
          </div>
          <p className={styles.headerRight}>
            Find something that speaks to your style, your creativity and the
            movement you believe in.
          </p>
        </div>

        {/* ── 5-Category Mosaic Grid ─────────────────── */}
        <div className={styles.mosaicGrid}>
          {/* Card 1: Large Featured Card (Women's Heels) */}
          <div
            onClick={() => onSelectCategory && onSelectCategory(featured.id)}
            className={`${styles.collectionCard} ${styles.colSpanLarge}`}
          >
            <div className={styles.imageWrap}>
              <Image
                src={featured.image}
                alt={featured.title}
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className={styles.cardImg}
              />
            </div>
            <div className={styles.cardOverlay} />
            <div className={styles.cardContent}>
              {featured.tag && (
                <span className={styles.hotTag}>{featured.tag}</span>
              )}
              <h3 className={styles.largeCardTitle}>{featured.title}</h3>
              {featured.subtitle && (
                <p className={styles.largeCardSubtitle}>{featured.subtitle}</p>
              )}
            </div>
          </div>

          {/* Cards 2 & 3: Middle Column (Handbags & Sneakers) */}
          <div className={styles.middleColumn}>
            {middleCols.map((col) => (
              <div
                key={col.id}
                onClick={() => onSelectCategory && onSelectCategory(col.id)}
                className={styles.collectionCard}
              >
                <div className={styles.imageWrap}>
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 30vw"
                    className={styles.cardImg}
                  />
                </div>
                <div className={styles.cardOverlay} />
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{col.title}</h3>
                  {col.subtitle && (
                    <span className={styles.cardSubtitle}>{col.subtitle}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cards 4 & 5: Right Column (Watch & Heel Sandals) */}
          <div className={styles.rightColumn}>
            {rightCols.map((col) => (
              <div
                key={col.id}
                onClick={() => onSelectCategory && onSelectCategory(col.id)}
                className={styles.collectionCard}
              >
                <div className={styles.imageWrap}>
                  <Image
                    src={col.image}
                    alt={col.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 28vw"
                    className={styles.cardImg}
                  />
                </div>
                <div className={styles.cardOverlay} />
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{col.title}</h3>
                  {col.subtitle && (
                    <span className={styles.cardSubtitle}>{col.subtitle}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MerchCollections;


