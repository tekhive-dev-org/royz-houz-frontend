import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import styles from "./EventDetailHero.module.css";

/**
 * EventDetailHero component displaying atmospheric hero banner with category pill, event title, date/time, and venue.
 */
export function EventDetailHero({ event }) {
  if (!event) return null;

  const category = (event.categoryTag || event.category || "FASHION SHOW").toUpperCase();
  const heroImage = event.heroImage || event.image || "/assets/img/events/events-hero-bg.png";
  const dateFormatted = event.dateString || `${event.month} ${event.day}, ${event.year} · ${event.time || "10:00 PM"}`;
  const locationFormatted = event.venue || event.location || "National Diamond Centre, Abuja, Central";

  return (
    <section className={styles.heroSection} aria-label={event.title}>
      {/* Full-Bleed Atmospheric Background Image */}
      <div className={styles.imageWrapper}>
        <Image
          src={heroImage}
          alt={event.title}
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />
        <div className={styles.gradientOverlay} />
      </div>

      {/* Hero Content Container */}
      <div className={styles.contentContainer}>
        <div className={styles.innerContent}>
          {/* Category Tag Badge */}
          <div className={styles.categoryBadgeWrapper}>
            <span className={styles.categoryBadge}>{category}</span>
          </div>

          {/* Event Title */}
          <h1 className={styles.title}>{event.title}</h1>

          {/* Meta Info Bar: Date & Location */}
          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <Calendar className={styles.metaIcon} />
              <span>{dateFormatted}</span>
            </div>

            <div className={styles.metaDivider} aria-hidden="true" />

            <div className={styles.metaItem}>
              <MapPin className={styles.metaIcon} />
              <span>{locationFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventDetailHero;
