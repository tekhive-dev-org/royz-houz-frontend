import { useState } from "react";
import { COMMON_EVENT_TYPES } from "@/constants/talentBooking";
import styles from "./TalentBooking.module.css";

/**
 * Step 2: Event Information Form with validation
 */
export function Step2EventInfo({ formData, updateFormData, onNext }) {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!formData.eventType?.trim()) {
      newErrors.eventType = "Required";
    }

    if (!formData.eventDate?.trim()) {
      newErrors.eventDate = "Required";
    }

    if (!formData.eventLocation?.trim()) {
      newErrors.eventLocation = "Required";
    }

    if (!formData.eventDescription?.trim()) {
      newErrors.eventDescription = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReviewBooking = (e) => {
    e?.preventDefault();
    setTouched(true);

    if (validate()) {
      onNext();
    }
  };

  const handleChange = (field, value) => {
    updateFormData({ [field]: value });
    if (touched && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleReviewBooking} noValidate>
      <h2 className={styles.sectionTitle}>Event Information</h2>

      <div className={styles.formGrid}>
        {/* Event Type */}
        <div className={styles.formGroup}>
          <label htmlFor="eventType" className={styles.fieldLabel}>
            Event Type *
          </label>
          <input
            id="eventType"
            type="text"
            list="event-types-list"
            placeholder="e.g. Corporate Event, Concert, Wedding"
            value={formData.eventType || ""}
            onChange={(e) => handleChange("eventType", e.target.value)}
            className={`${styles.inputField} ${
              errors.eventType ? styles.inputError : ""
            }`}
          />
          <datalist id="event-types-list">
            {COMMON_EVENT_TYPES.map((type) => (
              <option key={type} value={type} />
            ))}
          </datalist>
          {errors.eventType && (
            <span className={styles.errorMessage}>{errors.eventType}</span>
          )}
        </div>

        {/* Event Date */}
        <div className={styles.formGroup}>
          <label htmlFor="eventDate" className={styles.fieldLabel}>
            Event Date *
          </label>
          <input
            id="eventDate"
            type="date"
            value={formData.eventDate || ""}
            onChange={(e) => handleChange("eventDate", e.target.value)}
            className={`${styles.inputField} ${
              errors.eventDate ? styles.inputError : ""
            }`}
          />
          {errors.eventDate && (
            <span className={styles.errorMessage}>{errors.eventDate}</span>
          )}
        </div>

        {/* Event Location */}
        <div className={styles.formGroup}>
          <label htmlFor="eventLocation" className={styles.fieldLabel}>
            Event Location *
          </label>
          <input
            id="eventLocation"
            type="text"
            placeholder="City, State or Venue"
            value={formData.eventLocation || ""}
            onChange={(e) => handleChange("eventLocation", e.target.value)}
            className={`${styles.inputField} ${
              errors.eventLocation ? styles.inputError : ""
            }`}
          />
          {errors.eventLocation && (
            <span className={styles.errorMessage}>{errors.eventLocation}</span>
          )}
        </div>

        {/* Event Description */}
        <div className={styles.formGroup}>
          <label htmlFor="eventDescription" className={styles.fieldLabel}>
            Event Description *
          </label>
          <textarea
            id="eventDescription"
            rows={4}
            placeholder="Describe your event, what you need from the talent, expected audience size..."
            value={formData.eventDescription || ""}
            onChange={(e) => handleChange("eventDescription", e.target.value)}
            className={`${styles.textareaField} ${
              errors.eventDescription ? styles.inputError : ""
            }`}
          />
          {errors.eventDescription && (
            <span className={styles.errorMessage}>
              {errors.eventDescription}
            </span>
          )}
        </div>

        {/* Approximate Budget */}
        <div className={styles.formGroup}>
          <label htmlFor="budget" className={styles.fieldLabel}>
            Approximate Budget (NGN)
          </label>
          <input
            id="budget"
            type="text"
            placeholder="e.g. 250,000"
            value={formData.budget || ""}
            onChange={(e) => handleChange("budget", e.target.value)}
            className={styles.inputField}
          />
        </div>

        {/* Submit Action */}
        <button type="submit" className={styles.continueButton}>
          Review Booking
        </button>
      </div>
    </form>
  );
}

export default Step2EventInfo;
