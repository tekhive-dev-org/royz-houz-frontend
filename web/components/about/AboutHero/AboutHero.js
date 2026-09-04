import Image from "next/image";
import Link from "next/link";
import { ABOUT_HERO_CONTENT } from "@/constants/aboutContent";
import styles from "./AboutHero.module.css";

/**
 * Hero section for the About Us page.
 * Displays moody concert background, "About Us" badge, bold statement headline and CTA.
 */
export function AboutHero({ content = ABOUT_HERO_CONTENT } = {}) {
  const hero = { ...ABOUT_HERO_CONTENT, ...(content || {}) };

  return (
    <section className={styles.hero} id="about-hero">
      {/* Background Image */}
      <Image
        src={hero.image}
        alt={hero.imageAlt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className={styles.bgImage}
      />

      {/* Dark Linear Gradient Overlay */}
      <div className={styles.overlay} aria-hidden="true" />

      {/* Main Hero Content */}
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Pill Badge */}
          <span className={styles.badge}>{hero.badge}</span>

          {/* Headline */}
          <h1 className={styles.headline}>
            {hero.headline}
            <span className={styles.headlineAccent}>{hero.headlineAccent}</span>
          </h1>

          {/* Subtitle / Mission Statement */}
          <p className={styles.description}>
            {hero.description}
          </p>

          {/* Call to Action Button */}
          <div>
            <Link href={hero.ctaHref} className={styles.ctaBtn}>
              {hero.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutHero;
