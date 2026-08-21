import { ArrowRight, MapPin, Clock } from "lucide-react";
import styles from "./ContactMap.module.css";

/**
 * ContactMap component matching the 1440x304 unified headquarters card specification.
 * Left: Warm beige panel (#F9F7F4) with "COME VISIT US" tag, headline, description, and "Get directions" button.
 * Right: Full interactive map with floating HQ address overlay card.
 */
export function ContactMap() {
  return (
    <section className={styles.section} id="contact-map" aria-label="Our Headquarters">
      <div className={styles.container}>
        <div className={styles.cardWrapper}>
          {/* ── Left Content Panel (#F9F7F4) ─────────── */}
          <div className={styles.leftPanel}>
            <div className={styles.panelTop}>
              <span className={styles.eyebrow}>COME VISIT US</span>
              <h2 className={styles.heading}>Our Headquarters</h2>
              <p className={styles.description}>
                We welcome you to visit our office and experience the Royz Houz
                culture firsthand.
              </p>
            </div>

            <div className={styles.panelBottom}>
              <a
                href="https://maps.google.com/?q=14+Coste+Avenue,+Lekki+Phase+2,+Lagos,+Nigeria"
                target="_blank"
                rel="noreferrer"
                className={styles.directionsBtn}
              >
                <span>Get directions</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ── Right Map Panel ───────────────────────── */}
          <div className={styles.rightPanel}>
            <iframe
              title="Royz Houz Headquarters Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.7279!2d3.4738!3d6.4316!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMjUnNTQuMCJOIDPCsDI4JzI1LjciRQ!5e0!3m2!1sen!2sng!4v1000000000000"
              className={styles.mapIframe}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Floating Info Overlay Card (#FDFCFC) */}
            <div className={styles.infoCard}>
              <div className={styles.infoCardHeader}>
                <div className={styles.redPinCircle}>
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h3 className={styles.infoTitle}>Royz Houz Headquarters</h3>
              </div>

              <p className={styles.infoAddress}>
                14 Coste Avenue, Lekki Phase 2, Lagos, Nigeria
              </p>

              <div className={styles.infoHoursRow}>
                <Clock className="w-3.5 h-3.5 text-[#868C98]" />
                <span className={styles.infoHours}>Mon – Fri, 8:00 AM – 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactMap;
