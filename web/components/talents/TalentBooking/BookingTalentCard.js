import Image from "next/image";
import styles from "./TalentBooking.module.css";

/**
 * Mini talent info card displayed at the top of booking form steps
 */
export function BookingTalentCard({ talent, currentStep }) {
  if (!talent) return null;

  const talentImage = talent.image || talent.avatar || "/assets/img/talents/zara.jpg";
  const talentGenre = talent.genre || talent.category || "Afrobeats / R&B";
  const talentLocation = talent.location || "Lagos, Nigeria";
  const bookingPrice = talent.bookingPrice || "₦250,000";

  return (
    <div className={styles.talentMiniCard}>
      <div className={styles.talentAvatarWrapper}>
        <Image
          src={talentImage}
          alt={talent.name}
          fill
          className="object-cover"
        />
      </div>

      <div className={styles.talentMetaGroup}>
        <h3 className={styles.talentName}>{talent.name}</h3>

        {currentStep === 3 ? (
          <span className={styles.talentSubtext}>{talentGenre}</span>
        ) : (
          <>
            <span className={styles.talentSubtext}>
              {talentGenre} • {talentLocation}
            </span>
            <span className={styles.talentPrice}>
              Booking from {bookingPrice}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingTalentCard;
