import Image from "next/image";
import styles from "./EventSpeakers.module.css";

/**
 * EventSpeakers component rendering 4-column speaker avatar cards.
 */
export function EventSpeakers({ event }) {
  const speakers = event?.speakers || [];

  if (speakers.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Featured Speakers">
      {/* Title with Amber Accent Bar */}
      <div className={styles.header}>
        <span className={styles.accentBar} aria-hidden="true" />
        <h2 className={styles.title}>Featured Speakers</h2>
      </div>

      {/* Responsive Speakers Grid */}
      <div className={styles.speakersGrid}>
        {speakers.map((speaker) => (
          <div key={speaker.id} className={styles.speakerCard}>
            <div className={styles.avatarWrapper}>
              <Image
                src={speaker.avatar || "/assets/img/talents/zara.jpg"}
                alt={speaker.name}
                fill
                sizes="80px"
                className={styles.avatar}
              />
            </div>

            <div className={styles.speakerInfo}>
              <h3 className={styles.speakerName}>{speaker.name}</h3>
              <p className={styles.speakerRole}>{speaker.role}</p>
              {speaker.organization && (
                <span className={styles.speakerOrg}>{speaker.organization}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default EventSpeakers;
