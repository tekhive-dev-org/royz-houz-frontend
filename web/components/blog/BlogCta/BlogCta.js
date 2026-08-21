import Link from "next/link";
import styles from "./BlogCta.module.css";

/**
 * BlogCta banner component inviting talented creatives to apply and join Royz Houz.
 */
export function BlogCta() {
  return (
    <section className={styles.section} aria-label="Talent Application Call to Action">
      <div className={styles.container}>
        <div className={styles.bannerCard}>
          <div className={styles.textGroup}>
            <h3 className={styles.title}>Are you a talented individual?</h3>
            <p className={styles.subtitle}>
              Join the Royz Houz family &amp; let&apos;s build your future together!
            </p>
          </div>

          <div className={styles.actionGroup}>
            <Link href="/join" className={styles.applyBtn}>
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default BlogCta;
