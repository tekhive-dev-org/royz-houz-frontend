import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { MapPin, ChevronDown } from "lucide-react";
import { EVENT_LOCATIONS } from "@/constants/events";
import styles from "./EventsHero.module.css";

/**
 * EventsHero component displaying banner, headline, description, and location selector.
 */
export function EventsHero({
  title = "Best Events You",
  highlightedTitle = "Shouldn't Miss!",
  description = "Looking for something to do in Nigeria? Whether you're a local, new in town or just cruising through we've got loads of great tips and events. You can explore by location, what's popular, our top picks, free stuff... you got this. Ready?",
  selectedLocation = "Nigeria",
  onLocationChange,
  locations = EVENT_LOCATIONS,
  backgroundImage = "/assets/img/events/events-hero-bg.jpg",
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleSelect = (loc) => {
    if (onLocationChange) {
      onLocationChange(loc);
    }
    setIsDropdownOpen(false);
  };

  return (
    <section className={styles.heroContainer} aria-label="Events Hero">
      {/* Background Media Image */}
      <Image
        src={backgroundImage}
        alt="Events festival crowd"
        fill
        priority
        sizes="100vw"
        className={styles.heroImage}
      />

      {/* Dark Vignette Gradient Overlay */}
      <div className={styles.heroGradientOverlay} />

      {/* Hero Content Container */}
      <div className={styles.heroContent}>
        {/* Dark Content Card on the Left */}
        <div className={styles.heroCard}>
          <h1 className={styles.heroTitle}>
            <span>{title}</span>
            <span className={styles.titleAmber}>{highlightedTitle}</span>
          </h1>

          <p className={styles.heroDescription}>{description}</p>

          {/* Location Dropdown Filter */}
          <div ref={dropdownRef} className={styles.locationDropdownContainer}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={styles.locationButton}
              aria-haspopup="listbox"
              aria-expanded={isDropdownOpen}
              aria-label="Select event location"
            >
              <div className={styles.locationLeft}>
                <MapPin className={styles.locationIcon} />
                <span className={styles.locationText}>{selectedLocation}</span>
              </div>
              <ChevronDown
                className={`${styles.locationChevron} ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div
                className={styles.dropdownMenu}
                role="listbox"
                aria-label="Locations list"
              >
                {locations.map((loc) => {
                  const isActive = loc === selectedLocation;
                  return (
                    <button
                      key={loc}
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onClick={() => handleSelect(loc)}
                      className={`${styles.dropdownItem} ${
                        isActive ? styles.dropdownItemActive : ""
                      }`}
                    >
                      <span>{loc}</span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C8781A]" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EventsHero;
