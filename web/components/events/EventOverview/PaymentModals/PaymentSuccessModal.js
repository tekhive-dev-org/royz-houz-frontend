import { useEffect } from "react";
import { Check, X, Download } from "lucide-react";
import styles from "./PaymentModals.module.css";

/**
 * PaymentSuccessModal component displayed upon successful Paystack payment verification.
 */
export function PaymentSuccessModal({
  isOpen,
  onClose,
  orderData,
  onDownloadTicket,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose?.();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const reference = orderData?.reference || "RH-" + Math.floor(100000 + Math.random() * 900000);
  const attendeeName = orderData?.formData
    ? `${orderData.formData.firstName} ${orderData.formData.lastName}`.trim()
    : "Bisola Jeladine";
  const attendeeEmail = orderData?.formData?.email || "bisolajeladine994@gmail.com";
  const tierName = orderData?.tier?.name || "Standard";
  const quantity = orderData?.quantity || 1;
  const eventTitle = orderData?.eventTitle || "Fashion Forward: Abuja";
  const grandTotal = orderData?.grandTotal || 86000;

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Top Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={styles.closeBtn}
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-[#525866]" />
        </button>

        {/* Success Icon */}
        <div className={styles.successIconWrapper}>
          <div className={styles.successIconInner}>
            <Check className="w-8 h-8 text-emerald-600 stroke-[3]" />
          </div>
        </div>

        {/* Header Content */}
        <div className={styles.headerContent}>
          <h2 id="success-modal-title" className={styles.modalTitle}>
            Payment Successful!
          </h2>
          <p className={styles.modalSubtitle}>
            Your booking is confirmed. We&apos;ve sent your e-ticket and receipt to{" "}
            <span className={styles.highlightText}>{attendeeEmail}</span>.
          </p>
        </div>

        {/* Order Details Receipt Box */}
        <div className={styles.receiptBox}>
          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Order Reference</span>
            <span className={styles.receiptRefCode}>#{reference}</span>
          </div>

          <div className={styles.receiptDivider} />

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Event</span>
            <span className={styles.receiptValue}>{eventTitle}</span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Ticket Type</span>
            <span className={styles.receiptValue}>
              {tierName} Ticket × {quantity}
            </span>
          </div>

          <div className={styles.receiptRow}>
            <span className={styles.receiptLabel}>Attendee</span>
            <span className={styles.receiptValue}>{attendeeName}</span>
          </div>

          <div className={styles.receiptDivider} />

          <div className={styles.receiptRow}>
            <span className={styles.receiptTotalLabel}>Amount Paid</span>
            <span className={styles.receiptTotalValue}>
              ₦{grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionsColumn}>
          <button
            type="button"
            onClick={onDownloadTicket || onClose}
            className={styles.primarySuccessBtn}
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD E-TICKET (PDF)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={styles.secondaryBtn}
          >
            <span>Back to Event Details</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessModal;
