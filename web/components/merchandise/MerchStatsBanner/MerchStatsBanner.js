import Image from "next/image";
import styles from "./MerchStatsBanner.module.css";

/**
 * MerchStatsBanner Component
 * Displays "What Makes Us Different" with dual stat cards ("Happy Customers", "Our Quality Products")
 * and an editorial lifestyle interior with terracotta backdrop block.
 */
export function MerchStatsBanner() {
  return (
    <section className={styles.section} aria-label="What Makes Us Different">
      {/* Terracotta Decorative Backdrop Block */}
      <div className={styles.terracottaBackdrop} aria-hidden="true" />

      <div className={styles.container}>
        <div className={styles.grid}>
          {/* ── Left Column: Heading, Subtitle & Stat Cards ── */}
          <div className={styles.leftCol}>
            <div className={styles.textWrap}>
              <h2 className={styles.title}>
                What Makes Us<br />Different
              </h2>
              <p className={styles.subtitle}>Affordability, durability &amp; quality</p>
            </div>

            <div className={styles.statsRow}>
              {/* Card 1: Terracotta Card */}
              <div className={styles.statCardTerracotta}>
                <span className={styles.statLabelLight}>Happy Customers</span>
                <span className={styles.statValueLight}>50K+</span>
              </div>

              {/* Card 2: White Card */}
              <div className={styles.statCardWhite}>
                <span className={styles.statLabelDark}>Our Quality Products</span>
                <span className={styles.statValueDark}>8K+</span>
              </div>
            </div>
          </div>

          {/* ── Right Column: Living Room Image ────────────── */}
          <div className={styles.rightCol}>
            <div className={styles.imageCard}>
              <Image
                src="/assets/img/merchandise/living-room-stat.jpg"
                alt="Royz House Lifestyle Interior"
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className={styles.lifestyleImg}
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MerchStatsBanner;
