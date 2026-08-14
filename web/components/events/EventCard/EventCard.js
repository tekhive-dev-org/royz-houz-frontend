import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import styles from "./EventCard.module.css";

/**
 * EventCard component displaying event banner, floating date or category badge, location, and action CTA.
 */
export function EventCard({ event, isPast: isPastProp }) {
  if (!event) return null;

  const isPast = isPastProp || event.isPast;

  // Format month to Title Case (e.g. "May")
  const rawMonth = event.month || "May";
  const formattedMonth =
    rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1).toLowerCase();

  const categoryLabel =
    event.categoryTag || (event.category || "SUMMIT").toUpperCase();

  const locationText =
    event.dateString ||
    (isPast
      ? `${formattedMonth} ${event.year || "2025"} · ${event.location}`
      : event.location);

  return (
    <article className={`${styles.card} group`} aria-label={event.title}>
      {/* Event Image & Badge */}
      <div className={styles.imageWrapper}>
        <Image
          src={event.image || "/assets/img/events/event1.jpg"}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className={styles.image}
        />
        <div className={styles.imageOverlay} />

        {isPast ? (
          /* Past Event Category Tag */
          <div className={styles.categoryBadge}>{categoryLabel}</div>
        ) : (
          /* Upcoming Event Date Badge */
          <div className={styles.dateBadge}>
            <span className={styles.dateDay}>{event.day || "24"}</span>
            <span className={styles.dateMonth}>{formattedMonth}</span>
            {event.year && <span className={styles.dateYear}>{event.year}</span>}
          </div>
        )}
      </div>

      {/* Event Details Content */}
      <div className={styles.content}>
        <div className={styles.detailsHeader}>
          <h3 className={styles.title}>
            <Link
              href={isPast ? event.recapLink || "#" : event.ticketLink || "#"}
              className="hover:underline"
            >
              {event.title}
            </Link>
          </h3>

          <div className={styles.locationRow}>
            <MapPin className={styles.locationIcon} />
            <span>{locationText}</span>
          </div>

          {!isPast && event.description && (
            <p className={styles.description}>{event.description}</p>
          )}
        </div>

        {/* Card Action / Footer */}
        {isPast ? (
          <div className={styles.pastFooter}>
            <span className={styles.attendeesText}>
              {event.attendees || "3,400 attended"}
            </span>
            <Link
              href={event.recapLink || "#"}
              className={styles.viewRecapBtn}
              aria-label={`View recap for ${event.title}`}
            >
              View Recap
            </Link>
          </div>
        ) : (
          <Link
            href={event.ticketLink || "#"}
            className={styles.registerBtn}
            aria-label={`Register for ${event.title}`}
          >
            Register Now
          </Link>
        )}
      </div>
    </article>
  );
}

export default EventCard;


