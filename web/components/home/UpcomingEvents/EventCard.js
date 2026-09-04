import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import styles from "./UpcomingEvents.module.css";

/**
 * Individual event card used inside the UpcomingEvents carousel.
 * Renders the background image, date badge, title, location, and ticket CTA.
 */
export function EventCard({ event = {}, ticketLabel = "Get Ticket" }) {
  const eventContent = {
    image: "/assets/img/events/events-hero-bg.png",
    title: "Upcoming event",
    day: "",
    month: "",
    year: "",
    location: "",
    ...event,
  };

  return (
    <article className={styles.card}>
      {/* Background Image */}
      <Image
        src={eventContent.image}
        alt={eventContent.title}
        fill
        sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 464px"
        className={styles.cardImage}
      />

      {/* Dark Gradient Overlay */}
      <div className={styles.overlay} />

      {/* Top-Left Date Badge */}
      <div className={styles.dateBadge}>
        <span className={styles.dateText}>{eventContent.day}</span>
        <span className={styles.dateText}>{eventContent.month}</span>
        <span className={styles.dateText}>{eventContent.year}</span>
      </div>

      {/* Bottom Card Content */}
      <div className={styles.cardContent}>
        <h3 className={styles.eventTitle}>{eventContent.title}</h3>

        <div className={styles.locationRow}>
          <MapPin className={styles.locationIcon} />
          <span className={styles.locationText}>{eventContent.location}</span>
        </div>

        <Link
          href={eventContent.ticketLink || (eventContent.slug || eventContent.id ? `/events/${eventContent.slug || eventContent.id}` : "/events")}
          className={styles.ticketBtn}
        >
          <span className={styles.ticketBtnText}>{ticketLabel}</span>
        </Link>
      </div>
    </article>
  );
}
