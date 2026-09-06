import Image from "next/image";
import styles from "./DonateHero.module.css";

/**
 * DonateHero component matching the split hero design.
 * Left: "DONATION" badge, dual-tone headline, description, and copper accent bar.
 * Right: Full-bleed right edge hero image.
 */
export function DonateHero({ hero = {} }) {
  const badge = hero?.badge || "DONATION";
  const headlinePart1 = hero?.headlinePart1 || "TOGETHER WE CAN CREATE";
  const headlineAccent1 = hero?.headlineAccent1 || "OPPORTUNITIES";
  const headlinePart2 = hero?.headlinePart2 || "& CHANGE";
  const headlineAccent2 = hero?.headlineAccent2 || "LIVES";
  const description =
    hero?.description ||
    "Your Support not just only empowers talents but also creates more opportunities and builds a better future.";
  const heroImage = hero?.image || "/assets/img/donate-hero.jpg";
  const isExternal = typeof heroImage === "string" && heroImage.startsWith("http");

  return (
    <section className={styles.heroSection} aria-label="Donate Hero">
      <div className={styles.heroGrid}>
        {/* ── Left Content Column ──────────────────── */}
        <div className={styles.leftCol}>
          <div className={styles.contentWrap}>
            {/* Pill Badge */}
            <div className={styles.badgeWrapper}>
              <span className={styles.badge}>{badge}</span>
            </div>

            {/* Headline */}
            <h1 className={styles.headline}>
              {headlinePart1}{" "}
              {headlineAccent1 && (
                <span className={styles.copperText}>{headlineAccent1}</span>
              )}{" "}
              {headlinePart2}{" "}
              {headlineAccent2 && (
                <span className={styles.copperText}>{headlineAccent2}</span>
              )}
            </h1>

            {/* Description */}
            <p className={styles.description}>{description}</p>

            {/* Copper Accent Bar */}
            <div className={styles.accentBar} aria-hidden="true" />
          </div>
        </div>

        {/* ── Right Image Column (Bleeds to 100vw right) ── */}
        <div className={styles.rightCol}>
          <div className={styles.imageContainer}>
            <Image
              src={heroImage}
              alt="Together we create opportunities through donation"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className={styles.heroImg}
              priority
              unoptimized={isExternal}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default DonateHero;
