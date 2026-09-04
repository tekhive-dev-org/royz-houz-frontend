import Link from "next/link";
import { HOMEPAGE_SUPPORT_MOVEMENT_CONTENT } from "@/constants/homepageContent";
import styles from "./SupportMovement.module.css";

/**
 * Support the Movement donation CTA section component.
 */
export function SupportMovement({ content }) {
  const supportContent = {
    ...HOMEPAGE_SUPPORT_MOVEMENT_CONTENT,
    ...content,
    cta: { ...HOMEPAGE_SUPPORT_MOVEMENT_CONTENT.cta, ...content?.cta },
  };
  return (
    <section className={styles.section} id="support-movement">
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Left Column: Heading & Description */}
          <div className={styles.leftCol}>
            {/* Tagline / Sub-badge */}
            <div className={styles.badgeRow}>
              <span className={styles.badgeLine} aria-hidden="true" />
              <span>{supportContent.badge}</span>
            </div>

            {/* Main Headline */}
            <h2 className={styles.headline}>
              {supportContent.headline}
            </h2>

            {/* Description */}
            <p className={styles.description}>
              {supportContent.description}
            </p>
          </div>

          {/* Right Column: Make A Donation CTA Button */}
          <div className={styles.rightCol}>
            <Link href={supportContent.cta.href} className={styles.donateBtn}>
              {supportContent.cta.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SupportMovement;
