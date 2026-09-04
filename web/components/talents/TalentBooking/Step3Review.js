import styles from "./TalentBooking.module.css";

/**
 * Step 3: Review Booking Request & Consent Agreement
 */
export function Step3Review({ formData, updateFormData, onConfirm, isSubmitting = false, submitError = "" }) {
  const fullName = `${formData.firstName || ""} ${formData.lastName || ""}`.trim();
  const formattedBudget = formData.budget
    ? formData.budget.startsWith("₦")
      ? formData.budget
      : `₦${formData.budget}`
    : "";

  const handleCheckboxChange = (e) => {
    updateFormData({ agreedToTerms: e.target.checked });
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (formData.agreedToTerms) {
      onConfirm();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Key-Value Review Summary */}
      <div className={styles.reviewTable}>
        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Name</span>
          <span className={styles.reviewValue}>{fullName}</span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Email</span>
          <span className={styles.reviewValue}>{formData.email || ""}</span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Phone</span>
          <span className={styles.reviewValue}>{formData.phone || ""}</span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Event Type</span>
          <span className={styles.reviewValue}>{formData.eventType || ""}</span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Date</span>
          <span className={styles.reviewValue}>{formData.eventDate || ""}</span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Location</span>
          <span className={styles.reviewValue}>{formData.eventLocation || ""}</span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Budget</span>
          <span className={styles.reviewValue}>{formattedBudget}</span>
        </div>

        <div className={styles.reviewRow}>
          <span className={styles.reviewKey}>Description</span>
          <p className={styles.reviewValueDescription}>
            {formData.eventDescription || ""}
          </p>
        </div>
      </div>

      {/* Disclaimer Notice Banner */}
      <div className={styles.disclaimerCard}>
        <p className={styles.disclaimerText}>
          By confirming this booking request, you agree to Royz House&apos;s booking terms. The
          talent will review your request and respond within 48 hours. No payment is required
          at this stage.
        </p>
      </div>

      {/* Terms Checkbox */}
      <label className={styles.agreementLabel}>
        <input
          type="checkbox"
          checked={Boolean(formData.agreedToTerms)}
          onChange={handleCheckboxChange}
          className={styles.agreementCheckbox}
        />
        <span>I agree to the Royz House Booking Terms &amp; Conditions and Privacy Policy</span>
      </label>

      {submitError ? (
        <p className={styles.errorMessage} role="alert">
          {submitError}
        </p>
      ) : null}

      {/* Submit Booking Request Button */}
      <button
        type="submit"
        disabled={!formData.agreedToTerms || isSubmitting}
        className={
          formData.agreedToTerms && !isSubmitting
            ? styles.continueButton
            : styles.continueButtonDisabled
        }
      >
        {isSubmitting ? "Submitting Request…" : "Confirm Booking Request"}
      </button>
    </form>
  );
}

export default Step3Review;
