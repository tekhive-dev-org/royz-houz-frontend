import styles from "./TalentProfileSidebar.module.css";

/**
 * BookingCard sidebar widget displaying pricing and booking action buttons.
 */
export function BookingCard({ talent, onBookClick }) {
  const price = talent?.bookingPrice || "₦250,000";

  return (
    <div className={styles.bookingCard} aria-label="Booking Information">
      <span className={styles.bookingSubtitle}>Booking starts from</span>
      <span className={styles.bookingPrice}>{price}</span>

      <button
        type="button"
        onClick={onBookClick}
        className={styles.bookTalentBtn}
      >
        Book This Talent
      </button>

      <button
        type="button"
        onClick={() => alert(`Direct message dialog opened for ${talent.name}`)}
        className={styles.messageBtn}
      >
        Send a Message
      </button>

      <p className={styles.responseNotice}>Usually responds within 24 hours</p>
    </div>
  );
}

export default BookingCard;
