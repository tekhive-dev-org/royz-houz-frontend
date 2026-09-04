import Image from "next/image";
import { getTalentBookingPrice } from "../TalentProfile/talentProfileData";
import styles from "./TalentBooking.module.css";

/**
 * Mini talent info card displayed at the top of booking form steps
 */
export function BookingTalentCard({ talent, currentStep }) {
  if (!talent) return null;

  const talentImage = talent.image || talent.avatar;
  const talentGenre = talent.genre || talent.category || "";
  const talentLocation = talent.location || "";
  const talentDetails = [talentGenre, talentLocation].filter(Boolean).join(" • ");
  const bookingPrice = getTalentBookingPrice(talent);

  return (
    <div className={styles.talentMiniCard}>
      <div className={styles.talentAvatarWrapper}>
        {talentImage && (
          <Image
            src={talentImage}
            alt={talent.name || "Talent"}
            fill
            className="object-cover"
          />
        )}
      </div>

      <div className={styles.talentMetaGroup}>
        <h3 className={styles.talentName}>{talent.name}</h3>

        {currentStep === 3 ? (
          <span className={styles.talentSubtext}>{talentGenre}</span>
        ) : (
          <>
            <span className={styles.talentSubtext}>
              {talentDetails}
            </span>
            <span className={styles.talentPrice}>
              {bookingPrice ? `Booking from ${bookingPrice}` : "Contact for pricing"}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingTalentCard;
