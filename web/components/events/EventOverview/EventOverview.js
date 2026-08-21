import { useState, useRef } from "react";
import { EventDetailHero } from "./EventDetailHero/EventDetailHero";
import { EventTicketSelector } from "./EventTicketSelector/EventTicketSelector";
import { EventAbout } from "./EventAbout/EventAbout";
import { EventSpeakers } from "./EventSpeakers/EventSpeakers";
import { EventSchedule } from "./EventSchedule/EventSchedule";
import { EventGallery } from "./EventGallery/EventGallery";
import { EventFAQ } from "./EventFAQ/EventFAQ";
import { EventSidebar } from "./EventSidebar/EventSidebar";
import { EventPopularEvents } from "./EventPopularEvents/EventPopularEvents";
import styles from "./EventOverview.module.css";

/**
 * EventOverview component composing full event overview & recap page layout.
 */
export function EventOverview({ event }) {
  const ticketRef = useRef(null);
  const isPast = Boolean(event?.isPast || event?.categoryTag === "PAST EVENTS");

  const tiers = event?.ticketTiers || [];
  const defaultTier = tiers.find((t) => t.isDefault) || tiers[1] || tiers[0];
  const [selectedTierId, setSelectedTierId] = useState(defaultTier?.id || "standard");
  const selectedTier = tiers.find((t) => t.id === selectedTierId) || defaultTier;

  const scrollToTickets = () => {
    ticketRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Atmospheric Hero Banner with Category Badge / Past Event Badge & Countdown */}
      <EventDetailHero event={event} />

      {/* 2. Main Two-Column Layout */}
      <div className={styles.mainContainer}>
        <div className={styles.grid}>
          {/* Left Column: Details & Schedule */}
          <div className={styles.leftColumn}>
            {/* Ticket Tier Selector (Only for Upcoming Events) */}
            {!isPast && (
              <div ref={ticketRef} className="mb-6">
                <EventTicketSelector
                  event={event}
                  selectedTierId={selectedTierId}
                  onSelectTier={setSelectedTierId}
                />
              </div>
            )}

            {/* About this Event */}
            <EventAbout event={event} />

            {/* Featured Speakers & Performers */}
            <EventSpeakers event={event} />

            {/* Event Schedule Timeline */}
            <EventSchedule event={event} />

            {/* Event Highlight Recap Gallery */}
            <EventGallery event={event} />

            {/* Frequently Asked Questions */}
            <EventFAQ event={event} />
          </div>

          {/* Right Column: Sticky Pricing / Archive Ticket & Venue Map Sidebar */}
          <div className={styles.rightColumn}>
            <EventSidebar
              event={event}
              selectedTier={selectedTier}
              onGetTickets={scrollToTickets}
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Popular Events / Also on the Calendar Section */}
      <div id="popular-events-section">
        <EventPopularEvents />
      </div>
    </div>
  );
}

export default EventOverview;
