import { useRouter } from "next/router";
import { Check } from "lucide-react";
import styles from "./TalentBooking.module.css";

/**
 * Step 4: Booking Confirmation View matching the exact mockup
 */
export function Step4Confirmed({ talent, formData }) {
  const router = useRouter();

  const talentName = talent?.name || "Zara Diallo";
  const userEmail = formData?.email || "your email";
  const refCode = formData?.bookingReference || "RH-MSJ4K0B0";

  const handleReturnToProfile = () => {
    if (talent?.slug || talent?.id) {
      router.push(`/talents/${talent.slug || talent.id}`);
    } else {
      router.push("/talents");
    }
  };

  const handleExploreMoreTalents = () => {
    router.push("/talents");
  };

  return (
    <div className={styles.successContainer}>
      {/* Checkmark Circle Icon */}
      <div className={styles.successIconCircle}>
        <Check className="w-8 h-8 stroke-[2.5]" />
      </div>

      {/* Headings */}
      <h2 className={styles.successHeading}>Booking Request Sent!</h2>
      <p className={styles.successSubheading}>
        Your request to book <span className="font-semibold text-[#0A0D14]">{talentName}</span> has been submitted.
      </p>

      {/* Reference Code */}
      <div className={styles.referenceTag}>
        Reference: <span className={styles.referenceHighlight}>{refCode}</span>
      </div>

      {/* "What happens next?" Card */}
      <div className={styles.nextStepsCard}>
        <h3 className={styles.nextStepsTitle}>What happens next?</h3>

        <div className={styles.stepsTimeline}>
          {/* Step 01 */}
          <div className={styles.stepItemRow}>
            <span className={styles.stepNumber}>01</span>
            <div className={styles.stepContent}>
              <span className={styles.stepItemTitle}>Confirmation Email</span>
              <span className={styles.stepItemDesc}>
                A confirmation has been sent to {userEmail}
              </span>
            </div>
          </div>

          {/* Step 02 */}
          <div className={styles.stepItemRow}>
            <span className={styles.stepNumber}>02</span>
            <div className={styles.stepContent}>
              <span className={styles.stepItemTitle}>Talent Review</span>
              <span className={styles.stepItemDesc}>
                {talentName} will review your request within 48 hours
              </span>
            </div>
          </div>

          {/* Step 03 */}
          <div className={styles.stepItemRow}>
            <span className={styles.stepNumber}>03</span>
            <div className={styles.stepContent}>
              <span className={styles.stepItemTitle}>Agreement &amp; Payment</span>
              <span className={styles.stepItemDesc}>
                If approved, you&apos;ll receive booking terms and payment instructions
              </span>
            </div>
          </div>

          {/* Step 04 */}
          <div className={styles.stepItemRow}>
            <span className={styles.stepNumber}>04</span>
            <div className={styles.stepContent}>
              <span className={styles.stepItemTitle}>You&apos;re All Set</span>
              <span className={styles.stepItemDesc}>
                Enjoy an unforgettable creative experience
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.confirmationBtnRow}>
        <button
          type="button"
          onClick={handleReturnToProfile}
          className={styles.returnBtn}
        >
          Return To Profile
        </button>

        <button
          type="button"
          onClick={handleExploreMoreTalents}
          className={styles.exploreBtn}
        >
          Explore More Talents
        </button>
      </div>
    </div>
  );
}

export default Step4Confirmed;
