import { Check, ChevronRight } from "lucide-react";
import {
  OPPORTUNITY_TYPES,
  GENERAL_AVAILABILITY_OPTIONS,
  ENGAGEMENT_TYPES,
  WORK_LOCATION_OPTIONS,
} from "@/constants/talentApplication";
import styles from "./TalentApplication.module.css";

/**
 * Step 4: Availability & Booking Form (Image 4)
 */
export function Step4AvailabilityBooking({
  formData,
  updateFormData,
  onNext,
  onBack,
}) {
  const selectedOpps = formData.opportunities || [];
  const selectedLocations = formData.workLocations || [];

  const handleToggleOpportunity = (id) => {
    const next = selectedOpps.includes(id)
      ? selectedOpps.filter((item) => item !== id)
      : [...selectedOpps, id];
    updateFormData({ opportunities: next });
  };

  const handleToggleLocation = (id) => {
    const next = selectedLocations.includes(id)
      ? selectedLocations.filter((item) => item !== id)
      : [...selectedLocations, id];
    updateFormData({ workLocations: next });
  };

  return (
    <div className={styles.stepContentWrapper}>
      {/* Step Header */}
      <div className={styles.stepHeader}>
        <h2 className={styles.stepTitle}>Availability &amp; Booking</h2>
        <p className={styles.stepSubtitle}>
          Help us understand your availability and the type of opportunities you are interested in.
        </p>
      </div>

      {/* 1. Are you interested in receiving booking through Royz Houz? */}
      <div className={styles.questionSection}>
        <label className={styles.questionTitle}>
          1. Are you interested in receiving booking through Royz Houz?
        </label>
        <div className={styles.choiceColumn}>
          {/* Yes Option */}
          <div
            className={`${styles.radioCard} ${
              formData.interestedInBookings === "yes" ? styles.radioCardSelected : ""
            }`}
            onClick={() => updateFormData({ interestedInBookings: "yes" })}
            tabIndex={0}
            role="radio"
            aria-checked={formData.interestedInBookings === "yes"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                updateFormData({ interestedInBookings: "yes" });
              }
            }}
          >
            <div className={styles.radioOuter}>
              {formData.interestedInBookings === "yes" && <div className={styles.radioInner} />}
            </div>
            <div className={styles.radioContent}>
              <span className={styles.radioTitle}>Yes, I&apos;m interested in bookings</span>
              <span className={styles.radioSubtitle}>
                I want to be considered for paid opportunities.
              </span>
            </div>
          </div>

          {/* No Option */}
          <div
            className={`${styles.radioCard} ${
              formData.interestedInBookings === "no" ? styles.radioCardSelected : ""
            }`}
            onClick={() => updateFormData({ interestedInBookings: "no" })}
            tabIndex={0}
            role="radio"
            aria-checked={formData.interestedInBookings === "no"}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                updateFormData({ interestedInBookings: "no" });
              }
            }}
          >
            <div className={styles.radioOuter}>
              {formData.interestedInBookings === "no" && <div className={styles.radioInner} />}
            </div>
            <div className={styles.radioContent}>
              <span className={styles.radioTitle}>
                No, I&apos;m currently joining for exposure/networking
              </span>
              <span className={styles.radioSubtitle}>
                I&apos;m not open to bookings at the moment.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. What opportunities are you interested in? */}
      <div className={styles.questionSection}>
        <label className={styles.questionTitle}>
          2. What opportunities are you interested in?
        </label>
        <span className={styles.questionHelper}>Select all that apply</span>

        <div className={styles.oppsGrid}>
          {OPPORTUNITY_TYPES.map((opp) => {
            const isChecked = selectedOpps.includes(opp.id);

            return (
              <div
                key={opp.id}
                className={`${styles.checkboxCard} ${
                  isChecked ? styles.checkboxCardSelected : ""
                }`}
                onClick={() => handleToggleOpportunity(opp.id)}
                tabIndex={0}
                role="checkbox"
                aria-checked={isChecked}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleOpportunity(opp.id);
                  }
                }}
              >
                <div
                  className={`${styles.checkboxBox} ${
                    isChecked ? styles.checkboxBoxChecked : ""
                  }`}
                >
                  {isChecked && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </div>
                <div className={styles.checkboxContent}>
                  <span className={styles.checkboxTitle}>{opp.title}</span>
                  <span className={styles.checkboxSubtitle}>{opp.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. When are you generally available? */}
      <div className={styles.questionSection}>
        <label className={styles.questionTitle}>
          3. When are you generally available?
        </label>
        <div className={styles.optionsList}>
          {GENERAL_AVAILABILITY_OPTIONS.map((opt) => {
            const isSelected = formData.generalAvailability === opt.id;

            return (
              <div
                key={opt.id}
                className={`${styles.simpleRadioItem} ${
                  isSelected ? styles.simpleRadioItemSelected : ""
                }`}
                onClick={() => updateFormData({ generalAvailability: opt.id })}
                tabIndex={0}
                role="radio"
                aria-checked={isSelected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    updateFormData({ generalAvailability: opt.id });
                  }
                }}
              >
                <div className={styles.radioOuter}>
                  {isSelected && <div className={styles.radioInner} />}
                </div>
                <span className={styles.simpleRadioLabel}>{opt.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Preferred engagement type */}
      <div className={styles.questionSection}>
        <label className={styles.questionTitle}>
          4. Preferred engagement type
        </label>
        <span className={styles.questionHelper}>How would you prefer to work?</span>

        <div className={styles.optionsList}>
          {ENGAGEMENT_TYPES.map((opt) => {
            const isSelected = formData.preferredEngagement === opt.id;

            return (
              <div
                key={opt.id}
                className={`${styles.simpleRadioItem} ${
                  isSelected ? styles.simpleRadioItemSelected : ""
                }`}
                onClick={() => updateFormData({ preferredEngagement: opt.id })}
                tabIndex={0}
                role="radio"
                aria-checked={isSelected}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    updateFormData({ preferredEngagement: opt.id });
                  }
                }}
              >
                <div className={styles.radioOuter}>
                  {isSelected && <div className={styles.radioInner} />}
                </div>
                <div className={styles.radioContent}>
                  <span className={styles.simpleRadioLabel}>{opt.label}</span>
                  <span className={styles.radioSubtitle}>{opt.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Where are you available to work? */}
      <div className={styles.questionSection}>
        <label className={styles.questionTitle}>
          5. Where are you available to work?
        </label>
        <span className={styles.questionHelper}>Select all that apply</span>

        <div className={styles.optionsList}>
          {WORK_LOCATION_OPTIONS.map((opt) => {
            const isChecked = selectedLocations.includes(opt.id);

            return (
              <div
                key={opt.id}
                className={`${styles.simpleRadioItem} ${
                  isChecked ? styles.simpleRadioItemSelected : ""
                }`}
                onClick={() => handleToggleLocation(opt.id)}
                tabIndex={0}
                role="checkbox"
                aria-checked={isChecked}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleToggleLocation(opt.id);
                  }
                }}
              >
                <div className={styles.radioOuter}>
                  {isChecked && <div className={styles.radioInner} />}
                </div>
                <div className={styles.radioContent}>
                  <span className={styles.simpleRadioLabel}>{opt.label}</span>
                  <span className={styles.radioSubtitle}>{opt.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className={styles.formNavRow}>
        <button type="button" onClick={onBack} className={styles.backBtn}>
          &lt; Back
        </button>

        <button type="button" onClick={onNext} className={styles.nextBtn}>
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default Step4AvailabilityBooking;
