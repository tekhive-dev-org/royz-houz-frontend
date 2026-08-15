import { useState, useEffect } from "react";
import Link from "next/link";
import { Calendar, Share2, ChevronRight, Check } from "lucide-react";
import styles from "./EventSidebar.module.css";

/**
 * EventSidebar component rendering price & availability, countdown timer, Get Tickets CTA, organizer, and event tags.
 */
export function EventSidebar({ event, selectedTier, onGetTickets }) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // Calculate live countdown timer
  useEffect(() => {
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
  }, [event?.countdownTarget]);

  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAddToCalendar = () => {
    const title = encodeURIComponent(event?.title || "Fashion Forward: Abuja");
    const details = encodeURIComponent(
      "Join Africa's premier fashion showcase highlighting creative innovation."
    );
    const location = encodeURIComponent(
      event?.venue || event?.location || "Abuja, Nigeria"
    );
    const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    window.open(gCalUrl, "_blank", "noopener,noreferrer");
  };

  const displayPrice =
    selectedTier?.priceFormatted ||
    (selectedTier?.price ? `₦${selectedTier.price.toLocaleString()}` : null) ||
    event?.startingPrice ||
    "₦25,000";

  const spotsRemaining = 195;
  const totalSpots = 800;
  const progressPercent = Math.min(
    Math.round(((totalSpots - spotsRemaining) / totalSpots) * 100),
    100
  );

  const partners = event?.partners || [
    "Unity Bank",
    "TechHive",
    "ArtsFund",
    "MediaCo",
    "StyleNG",
    "CreativeX",
  ];

  const artists = event?.performingArtists || [
    {
      id: "zara-diallo",
      name: "Zara Diallo",
      initial: "Z",
      href: "/talents/zara-diallo",
    },
  ];

  return (
    <aside className={styles.sidebarWrapper} aria-label="Event actions and details">
      {/* 1. Main Pricing, Availability & Countdown Card */}
      <div className={styles.actionCard}>
        {/* Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.priceAmount}>{displayPrice}</span>
          <span className={styles.priceSub}>/ ticket</span>
        </div>

        {/* Spots Remaining & Progress Bar */}
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

        {/* Countdown Header & Blocks */}
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

        {/* Primary CTA Button */}
        <button
          type="button"
          onClick={onGetTickets}
          className={styles.getTicketsBtn}
        >
          GET TICKETS
        </button>

        {/* Auxiliary Action Buttons */}
        <div className={styles.auxButtonsRow}>
          <button
            type="button"
            onClick={handleAddToCalendar}
            className={styles.auxBtn}
          >
            <Calendar className="w-4 h-4 text-[#525866]" />
            <span>Add to calender</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className={styles.auxBtn}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-600">Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-[#525866]" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Performing Artists Card */}
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
                <ChevronRight className="w-4 h-4 text-[#525866]" />
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* 3. Event Partners Card */}
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


    </aside>
  );
}

export default EventSidebar;
