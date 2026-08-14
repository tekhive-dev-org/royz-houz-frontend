import Image from "next/image";
import Link from "next/link";
import styles from "./AboutHero.module.css";

/**
 * Hero section for the About Us page.
 * Displays moody concert background, "About Us" badge, bold statement headline and CTA.
 */
export function AboutHero() {
  return (
    <section className={styles.hero} id="about-hero">
      {/* Background Image */}
      <Image
        src="/assets/img/about-hero.jpg"
        alt="A movement born from passion, driven by purpose"
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
          <span className={styles.badge}>About Us</span>

          {/* Headline */}
          <h1 className={styles.headline}>
            A MOVEMENT BORN FROM PASSION,
            <span className={styles.headlineAccent}>DRIVEN BY PURPOSE</span>
          </h1>

          {/* Subtitle / Mission Statement */}
          <p className={styles.description}>
            We discover. We develop. We empower. Together, we are a legacy that
            transforms lives and communities.
          </p>

          {/* Call to Action Button */}
          <div>
            <Link href="/donate" className={styles.ctaBtn}>
              Support Our Mission
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutHero;
