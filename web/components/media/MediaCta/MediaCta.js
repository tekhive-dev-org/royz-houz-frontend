import Link from "next/link";
import styles from "./MediaCta.module.css";

/**
 * MediaCta component presenting talent recruitment call-to-action banner.
 */
export function MediaCta({ pageContent = {} }) {
  const content = { heading: "Are you a talented individual?", subheading: "Join the Royz Houz family. Let's build your future together!", buttonLabel: "Apply Now", buttonHref: "/talents", ...pageContent };
  return (
    <section className={styles.ctaSection} aria-label="Talent Call to Action">
      <div className={styles.ctaCard}>
        <div className={styles.ctaLeft}>
          <h2 className={styles.ctaHeading}>{content.heading}</h2>
          <p className={styles.ctaSubheading}>{content.subheading}</p>
        </div>

        <div className={styles.ctaRight}>
          <Link href={content.buttonHref || "/talents"} className={styles.joinBtn}>
            <span>{content.buttonLabel}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MediaCta;
