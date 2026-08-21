import Image from "next/image";
import styles from "./DonateHero.module.css";

/**
 * DonateHero component matching the split hero design.
 * Left: "DONATION" badge, dual-tone headline, description, and copper accent bar.
 * Right: Full-bleed right edge hero image.
 */
export function DonateHero() {
  return (
    <section className={styles.heroSection} aria-label="Donate Hero">
      <div className={styles.heroGrid}>
        {/* ── Left Content Column ──────────────────── */}
        <div className={styles.leftCol}>
          <div className={styles.contentWrap}>
            {/* Pill Badge */}
            <div className={styles.badgeWrapper}>
              <span className={styles.badge}>DONATION</span>
            </div>

            {/* Headline */}
            <h1 className={styles.headline}>
              TOGETHER WE CAN CREATE{" "}
              <span className={styles.copperText}>OPPORTUNITIES</span> &amp;
              CHANGE <span className={styles.copperText}>LIVES</span>
            </h1>

            {/* Description */}
            <p className={styles.description}>
              Your Support not just only empowers talents but also creates more
              opportunities and builds a better future.
            </p>

            {/* Copper Accent Bar */}
            <div className={styles.accentBar} aria-hidden="true" />
          </div>
        </div>

        {/* ── Right Image Column (Bleeds to 100vw right) ── */}
        <div className={styles.rightCol}>
          <div className={styles.imageContainer}>
            <Image
              src="/assets/img/donate-hero.jpg"
              alt="Together we create opportunities through donation"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={styles.heroImg}
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default DonateHero;
