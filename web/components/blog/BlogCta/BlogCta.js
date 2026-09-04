import Link from "next/link";
import styles from "./BlogCta.module.css";

/**
 * BlogCta banner component inviting talented creatives to apply and join Royz Houz.
 */
export function BlogCta({ cta }) {
  const heading = cta?.heading || "Are you a talented individual?";
  const subheading =
    cta?.subheading || "Join the Royz Houz family & let's build your future together!";
  const buttonLabel = cta?.buttonLabel || "Apply Now";
  const buttonHref = cta?.buttonHref || "/join";

  return (
    <section className={styles.section} aria-label={heading}>
      <div className={styles.container}>
        <div className={styles.bannerCard}>
          <div className={styles.textGroup}>
            <h3 className={styles.title}>{heading}</h3>
            <p className={styles.subtitle}>{subheading}</p>
          </div>

          <div className={styles.actionGroup}>
            <Link href={buttonHref} className={styles.applyBtn}>
              {buttonLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogCta;
