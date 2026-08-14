import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { UPCOMING_EVENTS } from "@/constants/events";
import { Carousel } from "@/components/common/Carousel";
import { EventCard } from "./EventCard";
import styles from "./UpcomingEvents.module.css";

export function UpcomingEvents() {
  return (
    <section className={styles.section} id="upcoming-events">
      <div className={styles.container}>

        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <span className={styles.titleBar} aria-hidden="true" />
            <h2 className={styles.title}>Upcoming Events</h2>
          </div>

          <Link href="/events" className={styles.viewAllLink}>
            <span>View all events</span>
            <ChevronRight className={styles.viewAllIcon} />
          </Link>
        </div>

        {/* Reusable Carousel */}
        <Carousel
          items={UPCOMING_EVENTS}
          ariaLabel="Upcoming events carousel"
          renderItem={(event) => <EventCard event={event} />}
        />

      </div>
    </section>
  );
}

export default UpcomingEvents;
