import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Share2, ChevronRight, Check, ExternalLink } from "lucide-react";
import styles from "./EventSidebar.module.css";

/**
 * EventSidebar component:
 * - For Event Recap (Past Events): ONLY displays the Ticket Archive card & the real interactive Event Location Map card.
 * - For Live/Upcoming Events: displays pricing, countdown, ticket CTA, calendar/share buttons, and auxiliary info.
 */
export function EventSidebar({ event, selectedTier, onGetTickets }) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  const isPast = Boolean(event?.isPast || event?.categoryTag === "PAST EVENTS");

  // Live countdown for upcoming events only
  useEffect(() => {
    if (isPast) return;

    const target = event?.countdownTarget
      ? new Date(event.countdownTarget).getTime()
      : new Date("2026-10-08T22:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [event?.countdownTarget, isPast]);

  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(event?.title || "Royz House Event");
    const details = encodeURIComponent(
      event?.aboutParagraphs?.[0] || "Royz House Event Showcase."
    );
    const location = encodeURIComponent(
      event?.venue || event?.location || "Kumasi Cultural Centre, Kumasi, Lagos"
    );
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(gCalUrl, "_blank", "noopener,noreferrer");
  };

  const displayPrice =
    selectedTier?.priceFormatted ||
    (selectedTier?.price ? `₦${selectedTier.price.toLocaleString()}` : null) ||
    event?.startingPrice ||
    "₦45,000";

  const spotsRemaining = event?.spotsRemaining || 195;
  const totalSpots = event?.totalSpots || 800;
  const progressPercent = Math.min(
    Math.round(((totalSpots - spotsRemaining) / totalSpots) * 100),
    100
  );

  const venueName = event?.venueMap?.name || event?.venue || "Kumasi Cultural Centre";
  const venueAddress = event?.venueMap?.address || event?.location || "Kumasi Cultural Centre, Kumasi, Lagos";
  const mapGoogleUrl = event?.venueMap?.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(venueAddress)}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(venueAddress || venueName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const partners = event?.partners || [];
  const artists = event?.performingArtists || [];

  return (
    <aside className={styles.sidebarWrapper} aria-label="Event sidebar details">
      {/* ── 1. Event Recap (Past Event): Only Archive Ticket & Real Interactive Map ── */}
      {isPast ? (
        <>
          {/* Ticket Archive Card */}
          <div className={styles.ticketArchiveCard}>
            <h3 className={styles.ticketCardHeader}>Ticket</h3>
            <div className={styles.archiveSubBox}>
              <div className={styles.archiveLeft}>
                <span className={styles.archiveTitle}>Archive</span>
                <span className={styles.archiveSubtitle}>This event has ended</span>
              </div>
              <span className={styles.archiveClosedBadge}>Closed</span>
            </div>
          </div>

          {/* Real Interactive Venue & Location Map Card */}
          <div className={styles.venueMapCard}>
            <div className={styles.mapPreviewWrapper}>
              <iframe
                title={venueName}
                src={mapEmbedUrl}
                className={styles.mapIframe}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
              
              {/* Floating "Open in Maps" Badge */}
              <a
                href={mapGoogleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.openInMapsBadge}
              >
                <span>Open in Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className={styles.venueDetails}>
              <h4 className={styles.venueTitle}>{venueName}</h4>
              <p className={styles.venueAddress}>{venueAddress}</p>
            </div>
          </div>
        </>
      ) : (
        /* ── 2. Live/Upcoming Event State: Pricing, Countdown, and Live CTAs ── */
        <>
          <div className={styles.actionCard}>
            <div className={styles.priceRow}>
              <span className={styles.priceAmount}>{displayPrice}</span>
              <span className={styles.priceSub}>/ ticket</span>
            </div>

            <div className={styles.progressContainer}>
              <div className={styles.progressLabelRow}>
                <span className={styles.progressDot} />
                <span className={styles.progressText}>
                  {spotsRemaining} of {totalSpots} spots remaining
                </span>
              </div>

              <div className={styles.progressBarTrack}>
                <div
                  className={styles.progressBarFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className={styles.countdownSection}>
              <span className={styles.countdownHeader}>EVENT COUNTDOWN</span>

              <div className={styles.countdownGrid}>
                <div className={styles.timeBox}>
                  <span className={styles.timeDigit}>{timeLeft.days}</span>
                  <span className={styles.timeUnit}>DAYS</span>
                </div>

                <div className={styles.timeBox}>
                  <span className={styles.timeDigit}>{timeLeft.hours}</span>
                  <span className={styles.timeUnit}>HRS</span>
                </div>

                <div className={styles.timeBox}>
                  <span className={styles.timeDigit}>{timeLeft.minutes}</span>
                  <span className={styles.timeUnit}>MIN</span>
                </div>

                <div className={styles.timeBox}>
                  <span className={styles.timeDigit}>{timeLeft.seconds}</span>
                  <span className={styles.timeUnit}>SEC</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onGetTickets}
              className={styles.getTicketsBtn}
            >
              GET TICKETS
            </button>

            <div className={styles.auxButtonsRow}>
              <button
                type="button"
                onClick={handleAddToCalendar}
                className={styles.auxBtn}
              >
                <Calendar className="w-3.5 h-3.5 text-[#525866]" />
                <span>Add to calender</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className={styles.auxBtn}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#525866]" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Auxiliary Partners Card (Upcoming only) */}
          {partners.length > 0 && (
            <div className={styles.partnersCard}>
              <h3 className={styles.cardHeader}>EVENT PARTNERS</h3>
              <div className={styles.partnersGrid}>
                {partners.map((partner, idx) => (
                  <div key={idx} className={styles.partnerPill}>
                    {partner}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Performing Artists Card (Upcoming only) */}
          {artists.length > 0 && (
            <div className={styles.artistsCard}>
              <h3 className={styles.cardHeader}>PERFORMING ARTISTS</h3>
              <div className={styles.artistsList}>
                {artists.map((artist) => (
                  <Link
                    key={artist.id}
                    href={artist.href || `/talents/${artist.id}`}
                    className={styles.artistRow}
                  >
                    <div className={styles.artistLeft}>
                      <div className={styles.artistAvatar}>
                        {artist.initial || artist.name.charAt(0)}
                      </div>
                      <span className={styles.artistName}>{artist.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-[#525866]" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  );
}

export default EventSidebar;
