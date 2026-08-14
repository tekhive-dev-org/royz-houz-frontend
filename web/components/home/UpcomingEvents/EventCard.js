import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import styles from "./UpcomingEvents.module.css";

/**
 * Individual event card used inside the UpcomingEvents carousel.
 * Renders the background image, date badge, title, location, and ticket CTA.
 */
export function EventCard({ event }) {
  return (
    <article className={styles.card}>
      {/* Background Image */}
      <Image
        src={event.image}
        alt={event.title}
        fill
        sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 464px"
        className={styles.cardImage}
      />

      {/* Dark Gradient Overlay */}
      <div className={styles.overlay} />

      {/* Top-Left Date Badge */}
      <div className={styles.dateBadge}>
        <span className={styles.dateText}>{event.day}</span>
        <span className={styles.dateText}>{event.month}</span>
        <span className={styles.dateText}>{event.year}</span>
      </div>

      {/* Bottom Card Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.eventTitle}>{event.title}</h3>

        <div className={styles.locationRow}>
          <MapPin className={styles.locationIcon} />
          <span className={styles.locationText}>{event.location}</span>
        </div>

        <Link href={event.ticketLink} className={styles.ticketBtn}>
          <span className={styles.ticketBtnText}>Get Ticket</span>
        </Link>
      </div>
    </article>
  );
}
