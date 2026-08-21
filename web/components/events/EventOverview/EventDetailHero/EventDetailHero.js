import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { Calendar, MapPin, Share2, Check } from "lucide-react";
import styles from "./EventDetailHero.module.css";

/**
 * EventDetailHero component supporting both Past Event Recap hero with countdown & actions and Upcoming event hero.
 */
export function EventDetailHero({ event }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const isPast = Boolean(event?.isPast || event?.categoryTag === "PAST EVENTS");
  const heroImage = event.heroImage || event.image || "/assets/img/events/events-hero-bg.png";
  const dateFormatted = event.dateString || "8 March 2026 . 3 PM GMT";
  const locationFormatted = event.venue || event.location || "November 2022 · Abuja, Nigeria";

  const handleShare = async () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleSeeUpcoming = () => {
    const popularSection = document.getElementById("popular-events-section");
    if (popularSection) {
      popularSection.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/events");
    }
  };

  return (
    <>
      <section className={styles.heroSection} aria-label={event.title}>
        {/* Full-Bleed Atmospheric Background Image */}
        <div className={styles.imageWrapper}>
          <Image
            src={heroImage}
            alt={event.title}
            fill
            priority
            sizes="100vw"
            className={styles.heroImage}
          />
          <div className={styles.gradientOverlay} />
        </div>

        {/* Hero Content */}
        <div className={styles.contentContainer}>
          <div className={styles.innerContent}>
            {/* Top Category Badge */}
            <div>
              {isPast ? (
                <span className={styles.badgePastEvents}>PAST EVENTS</span>
              ) : (
                <span className={styles.categoryBadge}>
                  {(event.categoryTag || event.category || "FASHION SHOW").toUpperCase()}
                </span>
              )}
            </div>

            {/* Event Title */}
            <h1 className={styles.title}>{event.title}</h1>

            {/* Meta Info Bar: Date & Location */}
            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <Calendar className={styles.metaIcon} />
                <span>{dateFormatted}</span>
              </div>

              <div className={styles.metaItem}>
                <MapPin className={styles.metaIcon} />
                <span>{locationFormatted}</span>
              </div>
            </div>

            {/* Past Event Countdown (00:00:00:00) */}
            {isPast && (
              <div className={styles.countdownGrid}>
                <div className={styles.countdownBox}>
                  <span className={styles.countdownNumber}>00</span>
                  <span className={styles.countdownLabel}>DAYS</span>
                </div>

                <div className={styles.countdownBox}>
                  <span className={styles.countdownNumber}>00</span>
                  <span className={styles.countdownLabel}>HOURS</span>
                </div>

                <div className={styles.countdownBox}>
                  <span className={styles.countdownNumber}>00</span>
                  <span className={styles.countdownLabel}>MINUTES</span>
                </div>

                <div className={styles.countdownBox}>
                  <span className={styles.countdownNumber}>00</span>
                  <span className={styles.countdownLabel}>SECONDS</span>
                </div>
              </div>
            )}

            {/* Action Buttons for Past Events */}
            {isPast && (
              <div className={styles.heroBtnRow}>
                <button
                  type="button"
                  onClick={handleSeeUpcoming}
                  className={styles.upcomingBtn}
                >
                  See Upcoming Events
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className={styles.shareBtn}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Breadcrumb Navigation Line */}
      <div className={styles.breadcrumbContainer}>
        <div className={styles.breadcrumbInner}>
          <Link href="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <Link href="/events" className={styles.breadcrumbLink}>
            Event
          </Link>
          <span className={styles.breadcrumbSeparator}>&gt;</span>
          <span className={styles.breadcrumbCurrent}>{event.title}</span>
        </div>
      </div>
    </>
  );
}

export default EventDetailHero;
