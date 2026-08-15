import { useEffect } from "react";
import { AlertTriangle, X, RefreshCw } from "lucide-react";
import styles from "./PaymentModals.module.css";

/**
 * PaymentFailureModal component displayed if a Paystack transaction fails, cancels, or times out.
 */
export function PaymentFailureModal({
  isOpen,
  onClose,
  onRetry,
  errorMessage,
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

  const defaultError =
    errorMessage ||
    "Your transaction was not completed. No charges or debits were made to your account.";

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="failure-modal-title"
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

        {/* Failure Icon */}
        <div className={styles.failureIconWrapper}>
          <div className={styles.failureIconInner}>
            <AlertTriangle className="w-8 h-8 text-rose-600 stroke-[2.5]" />
          </div>
        </div>

        {/* Header Content */}
        <div className={styles.headerContent}>
          <h2 id="failure-modal-title" className={styles.modalTitle}>
            Payment Incomplete
          </h2>
          <p className={styles.modalSubtitle}>{defaultError}</p>
        </div>

        {/* Helpful Tips Box */}
        <div className={styles.tipsBox}>
          <span className={styles.tipsTitle}>Troubleshooting Tips:</span>
          <ul className={styles.tipsList}>
            <li>Check that your card or bank account has sufficient balance.</li>
            <li>Ensure online / international transactions are enabled on your card.</li>
            <li>Alternatively, you can choose a different payment option on Paystack (Bank Transfer, USSD, or QR code).</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionsColumn}>
          <button
            type="button"
            onClick={onRetry || onClose}
            className={styles.primaryFailureBtn}
          >
            <RefreshCw className="w-4 h-4" />
            <span>TRY PAYMENT AGAIN</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={styles.secondaryBtn}
          >
            <span>Cancel & Return to Checkout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailureModal;
