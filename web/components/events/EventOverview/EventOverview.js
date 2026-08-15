import { useState, useRef } from "react";
import { EventDetailHero } from "./EventDetailHero/EventDetailHero";
import { EventTicketSelector } from "./EventTicketSelector/EventTicketSelector";
import { EventAbout } from "./EventAbout/EventAbout";
import { EventSpeakers } from "./EventSpeakers/EventSpeakers";
import { EventGallery } from "./EventGallery/EventGallery";
import { EventFAQ } from "./EventFAQ/EventFAQ";
import { EventSidebar } from "./EventSidebar/EventSidebar";
import styles from "./EventOverview.module.css";

/**
 * EventOverview component composing full event overview page layout with hero, ticket booking, details, and sticky sidebar.
 */
export function EventOverview({ event }) {
  const ticketRef = useRef(null);

  const tiers = event?.ticketTiers || [];
  const defaultTier = tiers.find((t) => t.isDefault) || tiers[1] || tiers[0];
  const [selectedTierId, setSelectedTierId] = useState(defaultTier?.id || "standard");
  const selectedTier = tiers.find((t) => t.id === selectedTierId) || defaultTier;

  const scrollToTickets = () => {
    ticketRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Atmospheric Hero Banner */}
      <EventDetailHero event={event} />

      {/* 2. Main Two-Column Layout */}
      <div className={styles.mainContainer}>
        <div className={styles.grid}>
          {/* Left Column: Booking Flow & Details */}
          <div className={styles.leftColumn}>
            <div ref={ticketRef}>
              <EventTicketSelector
                event={event}
                selectedTierId={selectedTierId}
                onSelectTier={setSelectedTierId}
              />
            </div>

            <EventAbout event={event} />
            <EventSpeakers event={event} />
            <EventGallery event={event} />
            <EventFAQ event={event} />
          </div>

          {/* Right Column: Sticky Pricing, Countdown & Organizer Sidebar */}
          <div className={styles.rightColumn}>
            <EventSidebar
              event={event}
              selectedTier={selectedTier}
              onGetTickets={scrollToTickets}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventOverview;
