import Image from "next/image";
import styles from "./ContactHero.module.css";

/**
 * ContactHero component with full-bleed right edge support team photography.
 * Left: "GET IN TOUCH" badge, bold dual-tone headline, description, and copper accent line.
 * Right: High-resolution customer care & operations photography extending to the screen edge.
 */
export function ContactHero({ hero = {} }) {
  const badge = hero?.badge || "GET IN TOUCH";
  const headlinePart1 = hero?.headlinePart1 || "LET'S START A";
  const headlineAccent = hero?.headlineAccent || "CONVERSATION";
  const description =
    hero?.description ||
    "Whether you're a creative looking for opportunities, a partner interested in collaboration or simply want to connect with Royz Houz, we'd love to hear from you.";
  const image = hero?.image || "/assets/img/contact-hero.png";

  return (
    <section className={styles.hero} id="contact-hero" aria-label="Contact Hero">
      <div className={styles.wrapper}>
        {/* Left Text Column */}
        <div className={styles.leftCol}>
          <div className={styles.content}>
            {/* Pill Badge with Copper Border */}
            <div className={styles.badgeWrapper}>
              <span className={styles.badge}>{badge}</span>
            </div>

            {/* Main Headline */}
            <h1 className={styles.headline}>
              <span className={styles.headlineDark}>{headlinePart1}&nbsp;</span>
              <span className={styles.headlineAccent}>{headlineAccent}</span>
            </h1>

            {/* Description */}
            <p className={styles.description}>{description}</p>

            {/* Copper Accent Bar */}
            <div className={styles.accentBar} aria-hidden="true" />
          </div>
        </div>

        {/* Right Photo Column (Touches the 100vw right edge) */}
        <div className={styles.rightCol}>
          <Image
            src={image}
            alt="Royz Houz Support and Operations Team"
            fill
            priority
            quality={100}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={styles.heroImage}
          />
        </div>
      </div>
    </section>
  );
}

export default ContactHero;
