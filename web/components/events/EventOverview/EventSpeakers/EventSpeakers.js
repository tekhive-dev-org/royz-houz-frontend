import Image from "next/image";
import styles from "./EventSpeakers.module.css";

const DEFAULT_SPEAKERS = [
  {
    id: "amara-osei",
    name: "Dr. Amara Osei",
    role: "Creative Economy Strategist",
    organization: "African Union",
    avatar: "/assets/img/events/speakers/amara.jpg",
  },
  {
    id: "fatima-diallo",
    name: "Fatima Diallo",
    role: "CEO",
    organization: "West Africa Fashion Week",
    avatar: "/assets/img/events/speakers/fatima.jpg",
  },
  {
    id: "kwame-asante",
    name: "Kwame Asante",
    role: "Film Director",
    organization: "Nile Studios",
    avatar: "/assets/img/events/speakers/kwame.jpg",
  },
  {
    id: "ngozi-williams",
    name: "Ngozi Williams",
    role: "Music Entrepreneur",
    organization: "AfroSound Records",
    avatar: "/assets/img/events/speakers/ngozi.jpg",
  },
];

/**
 * EventSpeakers component rendering 4-column speaker avatar cards with exact design specs.
 */
export function EventSpeakers({ event }) {
  const speakers = (Array.isArray(event?.speakers) && event.speakers.length > 0)
    ? event.speakers
    : DEFAULT_SPEAKERS;

  return (
    <section className={styles.section} aria-label="Featured Speakers & Performers">
      {/* Title with Amber Accent Bar */}
      <div className={styles.header}>
        <span className={styles.accentBar} aria-hidden="true" />
        <h2 className={styles.title}>Featured Speakers &amp; Performers</h2>
      </div>

      {/* Responsive Speakers Grid */}
      <div className={styles.speakersGrid}>
        {speakers.map((speaker) => (
          <div key={speaker.id || speaker.name} className={styles.speakerCard}>
            <div className={styles.avatarWrapper}>
              <Image
                src={speaker.avatar || "/assets/img/events/speakers/fatima.jpg"}
                alt={speaker.name}
                fill
                sizes="(max-width: 640px) 64px, 80px"
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
