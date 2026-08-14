import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import styles from "./ReportModal.module.css";

const REPORT_REASONS = [
  "Copyright infringement",
  "Inappropriate content",
  "Misinformation",
  "Spam",
  "Other",
];

/**
 * ReportModal component with dynamic custom reason and email inputs when "Other" is selected.
 */
export function ReportModal({
  isOpen = false,
  onClose,
  targetTitle = "video",
  onSubmit,
}) {
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedReason("");
      setCustomReason("");
      setEmail("");
      setIsSubmitted(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isOther = selectedReason === "Other";
  const isFormValid = isOther
    ? customReason.trim().length > 0 && email.trim().length > 0 && email.includes("@")
    : Boolean(selectedReason);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setIsSubmitted(true);
    onSubmit?.({
      reason: selectedReason,
      customReason: isOther ? customReason.trim() : null,
      email: isOther ? email.trim() : null,
      targetTitle,
    });
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
    >
      {/* Viewport Top-Right Close Button */}
      <button
        type="button"
        onClick={onClose}
        className={styles.topCloseBtn}
        aria-label="Close report modal"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Modal Card */}
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {!isSubmitted ? (
          <div>
            <h2 id="report-modal-title" className={styles.title}>
              Report Content
            </h2>

            {/* List of Report Reasons */}
            <div className={styles.optionsList} role="radiogroup">
              {REPORT_REASONS.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedReason(reason)}
                    className={`${styles.optionBtn} ${
                      isSelected ? styles.optionBtnSelected : ""
                    }`}
                  >
                    {reason}
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
                    onChange={(e) => setCustomReason(e.target.value)}
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
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={styles.textInput}
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isFormValid}
              className={isFormValid ? styles.submitBtn : styles.submitBtnDisabled}
            >
              Submit Report
            </button>
          </div>
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
