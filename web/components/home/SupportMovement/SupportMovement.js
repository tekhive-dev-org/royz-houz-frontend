import Link from "next/link";
import styles from "./SupportMovement.module.css";

/**
 * Support the Movement donation CTA section component.
 */
export function SupportMovement() {
  return (
    <section className={styles.section} id="support-movement">
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Left Column: Heading & Description */}
          <div className={styles.leftCol}>
            {/* Tagline / Sub-badge */}
            <div className={styles.badgeRow}>
              <span className={styles.badgeLine} aria-hidden="true" />
              <span>SUPPORT THE MOVEMENT</span>
            </div>

            {/* Main Headline */}
            <h2 className={styles.headline}>
              YOUR SUPPORT MAKES A DIFFERENCE TO AFRICA&apos;S CREATIVE FUTURE
            </h2>

            {/* Description */}
            <p className={styles.description}>
              Every donation funds mentorship programmes, creative workshops, and
              scholarships for Africa&apos;s next generation.
            </p>
          </div>

          {/* Right Column: Make A Donation CTA Button */}
          <div className={styles.rightCol}>
            <Link href="/donate" className={styles.donateBtn}>
              Make A Donation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportMovement;
