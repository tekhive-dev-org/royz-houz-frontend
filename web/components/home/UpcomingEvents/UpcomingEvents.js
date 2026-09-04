import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HOMEPAGE_UPCOMING_EVENTS_CONTENT } from "@/constants/homepageContent";
import { Carousel } from "@/components/common/Carousel";
import { EventCard } from "./EventCard";
import styles from "./UpcomingEvents.module.css";

export function UpcomingEvents({ content }) {
  const sectionContent = { ...HOMEPAGE_UPCOMING_EVENTS_CONTENT, ...content };
  const events = Array.isArray(sectionContent.events)
    ? sectionContent.events
    : HOMEPAGE_UPCOMING_EVENTS_CONTENT.events;
  return (
    <section className={styles.section} id="upcoming-events">
      <div className={styles.container}>

        {/* Section Header */}
        <div className={styles.headerRow}>
          <div className={styles.titleGroup}>
            <span className={styles.titleBar} aria-hidden="true" />
            <h2 className={styles.title}>{sectionContent.title}</h2>
          </div>

          <Link href={sectionContent.viewAllHref} className={styles.viewAllLink}>
            <span>{sectionContent.viewAllLabel}</span>
            <ChevronRight className={styles.viewAllIcon} />
          </Link>
        </div>

        {/* Reusable Carousel */}
        <Carousel
          items={events}
          ariaLabel={sectionContent.carouselAriaLabel}
          renderItem={(event) => <EventCard event={event} ticketLabel={sectionContent.ticketLabel} />}
        />

      </div>
    </section>
  );
}

export default UpcomingEvents;
