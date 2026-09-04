import { useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import styles from "./ReportModal.module.css";

const REPORT_REASONS = [
  { value: "copyright", label: "Copyright infringement" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Other" },
];

function createSubmissionKey() {
  if (typeof crypto === "undefined") return "";
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  if (typeof crypto.getRandomValues !== "function") return "";

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
}

/**
 * ReportModal component with dynamic custom reason and email inputs when "Other" is selected.
 */
export function ReportModal({
  isOpen = false,
  onClose,
  targetTitle = "video",
  onSubmit,
}) {
  const modalRef = useRef(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [email, setEmail] = useState("");
  const [submissionKey, setSubmissionKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSubmissionKey(createSubmissionKey());
      return;
    }

    setSelectedReason("");
    setCustomReason("");
    setEmail("");
    setSubmissionKey("");
    setIsSubmitting(false);
    setSubmitError("");
    setIsSubmitted(false);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    modalRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const isOther = selectedReason === "other";
  const isFormValid = isOther
    ? customReason.trim().length > 0 && email.trim().length > 0 && email.includes("@")
    : Boolean(selectedReason);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isFormValid || isSubmitting) return;
    if (!submissionKey || typeof onSubmit !== "function") {
      setSubmitError("Reporting is temporarily unavailable. Please try again.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({
        submissionKey,
        reason: selectedReason,
        details: isOther ? customReason.trim() : null,
        reporterEmail: isOther ? email.trim() : null,
        targetTitle,
      });
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        error?.message || "Your report could not be submitted. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        if (!isSubmitting) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      {/* Viewport Top-Right Close Button */}
      <button
        type="button"
        onClick={onClose}
        disabled={isSubmitting}
        className={styles.topCloseBtn}
        aria-label="Close report modal"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Modal Card */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} noValidate>
            <h2 id="report-modal-title" className={styles.title}>
              Report Content
            </h2>

            {/* List of Report Reasons */}
            <div className={styles.optionsList} role="radiogroup">
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason.value;
                return (
                  <button
                    key={reason.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setSelectedReason(reason.value);
                      setSubmitError("");
                    }}
                    className={`${styles.optionBtn} ${
                      isSelected ? styles.optionBtnSelected : ""
                    }`}
                  >
                    {reason.label}
                  </button>
                );
              })}
            </div>

            {/* Dynamic Custom Inputs when "Other" is selected */}
            {isOther && (
              <div className={styles.otherInputsContainer}>
                <div className={styles.inputGroup}>
                  <label htmlFor="custom-report-reason" className={styles.inputLabel}>
                    Describe the issue <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="custom-report-reason"
                    rows={3}
                    value={customReason}
                    onChange={(e) => {
                      setCustomReason(e.target.value);
                      setSubmitError("");
                    }}
                    maxLength={2000}
                    placeholder="Please explain why you are reporting this content..."
                    className={styles.textareaInput}
                    required
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="custom-report-email" className={styles.inputLabel}>
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="custom-report-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setSubmitError("");
                    }}
                    maxLength={254}
                    placeholder="name@example.com"
                    className={styles.textInput}
                    required
                  />
                </div>
              </div>
            )}

            {submitError ? (
              <p className={styles.submitError} role="alert">
                {submitError}
              </p>
            ) : null}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={
                isFormValid && !isSubmitting
                  ? styles.submitBtn
                  : styles.submitBtnDisabled
              }
            >
              {isSubmitting ? "Submitting…" : "Submit Report"}
            </button>
          </form>
        ) : (
          <div className={styles.successContainer}>
            {/* Success Checkmark Icon */}
            <div className={styles.successIconBadge}>
              <Check className="w-7 h-7 text-[#B46A2C] stroke-[2.5]" />
            </div>

            <h2 className={styles.successTitle}>Report Submitted</h2>
            <p className={styles.successSubtitle}>
              Thank you. Our team will review this content.
            </p>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className={styles.closeBtn}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ReportModal;
