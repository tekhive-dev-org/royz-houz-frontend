import Link from "next/link";
import styles from "./ContactCTA.module.css";

/**
 * ContactCTA renders the "Are you a talented Individual?" call-to-action banner.
 * Warm beige card with copper border, headline, subtitle, and "Apply Now" button.
 */
export function ContactCTA({ cta = {} }) {
  const heading = cta?.heading || "Are you a talented Individual?";
  const subtitle = cta?.subtitle || "Join the Royz Houz family lets build your future together!";
  const btnText = cta?.btnText || "Apply Now";
  const btnHref = cta?.btnHref || "/talents";

  return (
    <section className={styles.section} aria-label="Talent Call to Action">
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.content}>
            <h2 className={styles.heading}>{heading}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          <Link href={btnHref} className={styles.ctaBtn}>
            {btnText}
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ContactCTA;
