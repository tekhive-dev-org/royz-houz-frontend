import Link from "next/link";
import styles from "./MediaCta.module.css";

/**
 * MediaCta component presenting talent recruitment call-to-action banner.
 */
export function MediaCta() {
  return (
    <section className={styles.ctaSection} aria-label="Talent Call to Action">
      <div className={styles.ctaCard}>
        <div className={styles.ctaLeft}>
          <h2 className={styles.ctaHeading}>Are you a talented Individual?</h2>
          <p className={styles.ctaSubheading}>
            Join the Royz Houz family lets build your future together!
          </p>
        </div>

        <div className={styles.ctaRight}>
          <Link href="/talents" className={styles.joinBtn}>
            <span>Apply Now</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MediaCta;
