import Link from "next/link";
import styles from "./TalentCTA.module.css";

/**
 * TalentCTA component prompting creative individuals to apply and join Royz Houz.
 */
export function TalentCTA() {
  return (
    <section
      className={styles.section}
      aria-label="Talent Application Call to Action"
    >
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.content}>
            <h2 className={styles.title}>Are you a talented Individual?</h2>
            <p className={styles.subtitle}>
              Join the Royz Houz family lets build your future together!
            </p>
          </div>

          <div className={styles.action}>
            <Link href="/join" className={styles.applyBtn}>
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TalentCTA;
