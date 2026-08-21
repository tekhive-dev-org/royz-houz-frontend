import Link from "next/link";
import styles from "./ContactCTA.module.css";

/**
 * ContactCTA renders the "Are you a talented Individual?" call-to-action banner.
 * Warm beige card with copper border, headline, subtitle, and "Apply Now" button.
 */
export function ContactCTA() {
  return (
    <section className={styles.section} aria-label="Talent Call to Action">
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.content}>
            <h2 className={styles.heading}>Are you a talented Individual?</h2>
            <p className={styles.subtitle}>
              Join the Royz Houz family lets build your future together!
            </p>
          </div>

          <Link href="/talents" className={styles.ctaBtn}>
            Apply Now
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ContactCTA;
