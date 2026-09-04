import Link from "next/link";
import Image from "next/image";
import { HOMEPAGE_HERO_CONTENT } from "@/constants/homepageContent";
import styles from "./HeroSection.module.css";

export function HeroSection({ content }) {
  const hero = {
    ...HOMEPAGE_HERO_CONTENT,
    ...content,
    primaryCta: { ...HOMEPAGE_HERO_CONTENT.primaryCta, ...content?.primaryCta },
    secondaryCta: { ...HOMEPAGE_HERO_CONTENT.secondaryCta, ...content?.secondaryCta },
  };
  const headlineLines = Array.isArray(hero.headlineLines)
    ? hero.headlineLines
    : HOMEPAGE_HERO_CONTENT.headlineLines;
  const headlineHighlightLines = Array.isArray(hero.headlineHighlightLines)
    ? hero.headlineHighlightLines
    : HOMEPAGE_HERO_CONTENT.headlineHighlightLines;
  const stats = Array.isArray(hero.stats) ? hero.stats : HOMEPAGE_HERO_CONTENT.stats;

  return (
    <section className={styles.heroSection}>
      {/* Background Image with Dark Vignette & Gradient Overlay */}
      <div className={styles.bgContainer}>
        <Image
          src={hero.backgroundImage}
          alt={hero.backgroundImageAlt}
          fill
          priority
          className={styles.bgImage}
        />
        {/* Gradients for readability */}
        <div className={styles.overlayGradient} />
      </div>

      {/* Main Hero Content */}
      <div className={styles.contentWrapper}>
        <div className={styles.textContent}>
          
          {/* Badge */}
          <div className={styles.badge}>
            <span className={styles.badgeText}>{hero.badge}</span>
          </div>

          {/* Headline */}
          <h1 className={styles.headline}>
            {headlineLines[0] ?? ""}<br />
            {headlineLines[1] ?? ""}<br />
            <span className={styles.headlineHighlight}>
              {headlineHighlightLines[0] ?? ""}<br />
              {headlineHighlightLines[1] ?? ""}
            </span>
          </h1>

          {/* Subtitle */}
          <p className={styles.subtitle}>
            {hero.description}
          </p>

          {/* Action CTA Buttons */}
          <div className={styles.actionsRow}>
            <Link href={hero.primaryCta.href} className={styles.primaryCta}>
              {hero.primaryCta.label}
            </Link>

            <Link href={hero.secondaryCta.href} className={styles.secondaryCta}>
              <span>{hero.secondaryCta.label}</span>
            </Link>
          </div>

          {/* Hero Stats Row */}
          <div className={styles.statsContainer}>
            {stats.map((stat, idx) => (
              <div key={stat?.id || idx} className={styles.statItem}>
                <div className={styles.statValue}>{stat?.value ?? ""}</div>
                <div className={styles.statLabel}>{stat?.label ?? ""}</div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroSection;
