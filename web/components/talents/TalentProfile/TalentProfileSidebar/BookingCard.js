import { useRouter } from "next/router";
import {
  getTalentBookingPrice,
  isTalentAvailableForBooking,
} from "../talentProfileData";
import styles from "./TalentProfileSidebar.module.css";

/**
 * BookingCard sidebar widget displaying pricing and booking action buttons.
 */
export function BookingCard({ talent, onBookClick }) {
  const router = useRouter();
  const price = getTalentBookingPrice(talent);
  const isBookingAvailable = isTalentAvailableForBooking(talent);

  const handleBook = () => {
    if (!isBookingAvailable) return;

    if (onBookClick) {
      onBookClick();
    } else {
      const talentIdentifier = talent?.slug || talent?.id;
      if (talentIdentifier) {
        router.push(`/talents/${talentIdentifier}/book`);
      }
    }
  };

  return (
    <div className={styles.bookingCard} aria-label="Booking Information">
      <span className={styles.bookingSubtitle}>{price ? "Booking starts from" : "Booking rate"}</span>
      <span className={styles.bookingPrice}>{price || "Contact for pricing"}</span>

      <button
        type="button"
        onClick={handleBook}
        disabled={!isBookingAvailable}
        aria-disabled={!isBookingAvailable}
        className={styles.bookTalentBtn}
      >
        Book This Talent
      </button>

      <button
        type="button"
        onClick={() => alert(`Direct message dialog opened for ${talent?.name || "talent"}`)}
        className={styles.messageBtn}
      >
        Send a Message
      </button>

      <p className={styles.responseNotice}>Usually responds within 24 hours</p>
    </div>
  );
}

export default BookingCard;
