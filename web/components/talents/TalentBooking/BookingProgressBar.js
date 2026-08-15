import { BOOKING_STEPS } from "@/constants/talentBooking";
import styles from "./TalentBooking.module.css";

/**
 * 4-Step Booking Progress Header with connected lines and step numbers
 */
export function BookingProgressBar({ currentStep, onStepClick }) {
  return (
    <div className={styles.progressBarContainer} aria-label="Booking steps progress">
      {BOOKING_STEPS.map((step, index) => {
        const isPassedOrCurrent = currentStep >= step.id;
        const isClickable = currentStep < 4 && step.id < currentStep && onStepClick;

        return (
          <div key={step.id} className="contents">
            {/* Step Node */}
            <div
              className={`${styles.stepIndicatorItem} ${isClickable ? "cursor-pointer" : ""}`}
              onClick={() => isClickable && onStepClick(step.id)}
            >
              <div
                className={`${styles.stepCircle} ${
                  isPassedOrCurrent
                    ? styles.stepCircleActive
                    : styles.stepCircleInactive
                }`}
              >
                <span>{step.id}</span>
              </div>
              <span
                className={`${styles.stepLabel} ${
                  isPassedOrCurrent
                    ? styles.stepLabelActive
                    : styles.stepLabelInactive
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting line (if not last item) */}
            {index < BOOKING_STEPS.length - 1 && (
              <div
                className={`${styles.progressConnectingLine} ${
                  currentStep > step.id
                    ? styles.lineCompleted
                    : styles.lineInactive
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default BookingProgressBar;
