import { EventCard } from "../EventCard";
import styles from "./EventsSection.module.css";

/**
 * EventsSection component rendering a section title with amber accent and 3-column event cards grid.
 */
export function EventsSection({
  title = "Upcoming Events",
  events = [],
  isPast = false,
  emptyMessage = "No events found for this selection.",
}) {
  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.innerContainer}>
        {/* Section Title with Amber Accent */}
        <div className={styles.sectionHeader}>
          <span className={styles.accentBar} aria-hidden="true" />
          <h2 className={styles.sectionTitle}>{title}</h2>
        </div>

        {/* 3-Column Responsive Grid */}
        <div className={styles.grid}>
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard key={event.id} event={event} isPast={isPast} />
            ))
          ) : (
            <div className={styles.emptyState}>
              <p className="text-sm">{emptyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default EventsSection;

