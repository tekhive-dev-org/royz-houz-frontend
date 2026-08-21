import Image from "next/image";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import { POPULAR_CALENDAR_EVENTS } from "@/constants/events";
import styles from "./EventPopularEvents.module.css";

/**
 * EventPopularEvents component rendering upcoming calendar events at the bottom of the page.
 */
export function EventPopularEvents({ events = POPULAR_CALENDAR_EVENTS }) {
  const displayEvents = events && events.length > 0 ? events : POPULAR_CALENDAR_EVENTS;

  return (
    <section className={styles.section} aria-label="Popular Events">
      {/* Top Header Row */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <div className={styles.headerTitleRow}>
            <span className={styles.accentBar} aria-hidden="true" />
            <h2 className={styles.title}>Popular Events</h2>
          </div>
          <p className={styles.subtitle}>Also on the calender</p>
        </div>

        <Link href="/events" className={styles.viewAllLink}>
          <span>View all Events</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* 2-Column Event Cards Grid */}
      <div className={styles.grid}>
        {displayEvents.slice(0, 2).map((eventItem) => (
          <article key={eventItem.id} className={styles.card}>
            {/* Background Image */}
            <Image
              src={eventItem.image || "/assets/img/events/event1.jpg"}
              alt={eventItem.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={styles.cardBgImage}
            />

            {/* Dark Gradient Overlay */}
            <div className={styles.cardGradient} aria-hidden="true" />

            {/* Top Date Badge */}
            <div className={styles.dateBadge}>
              <span className={styles.dateDay}>{eventItem.day}</span>
              <span className={styles.dateMonthYear}>
                {eventItem.month} {eventItem.year}
              </span>
            </div>

            {/* Bottom Card Content */}
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{eventItem.title}</h3>

              <div className={styles.cardLocation}>
                <MapPin className={styles.cardLocationIcon} />
                <span>{eventItem.location}</span>
              </div>

              <Link
                href={`/events/${eventItem.slug || eventItem.id}`}
                className={styles.getTicketBtn}
              >
                Get Ticket
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default EventPopularEvents;
