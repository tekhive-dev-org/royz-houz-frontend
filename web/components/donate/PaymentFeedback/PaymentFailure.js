import { useState } from "react";
import {
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import styles from "./PaymentFailure.module.css";

/**
 * PaymentFailure Component
 * Compassionate, clear diagnostic failure screen with troubleshooting guidance and retry actions.
 */
export function PaymentFailure({
  donationData,
  errorMessage,
  onRetry,
  onEditDetails,
}) {
  const [copied, setCopied] = useState(false);

  const amountNumber = donationData?.amount || 25000;
  const formattedAmount = `₦${amountNumber.toLocaleString()}`;
  const errorCode = `RH-ERR-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleCopyCode = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(errorCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.container} aria-label="Payment Unsuccessful">
      <div className={styles.card}>
        {/* ── Warning / Error Icon ─────────────────────── */}
        <div className={styles.iconWrapper}>
          <div className={styles.iconHalo} />
          <div className={styles.iconCircle}>
            <AlertTriangle className="w-10 h-10 text-rose-600" />
          </div>
        </div>

        {/* ── Title & Message ────────────────────────── */}
        <div className={styles.textHeader}>
          <span className={styles.badgeFailure}>Payment Incomplete</span>
          <h2 className={styles.title}>Payment Unsuccessful</h2>
          <p className={styles.subtitle}>
            We were unable to process your donation of{" "}
            <span className={styles.amountHighlight}>{formattedAmount}</span>.
            Don&apos;t worry, <strong>no funds have been debited</strong> from your account.
          </p>
        </div>

        {/* ── Diagnostic Reason Box ──────────────────── */}
        <div className={styles.diagnosticBox}>
          <div className={styles.diagnosticHeader}>
            <span className={styles.boxLabel}>Reason for Failure</span>
            <button
              type="button"
              onClick={handleCopyCode}
              className={styles.errCodeBtn}
              title="Copy error code for support"
            >
              <code>{errorCode}</code>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#868C98]" />
              )}
            </button>
          </div>

          <div className={styles.reasonMessage}>
            <p>
              {errorMessage ||
                "Your card issuer declined the transaction. This is usually due to insufficient funds, an expired card, or a 3D-Secure authentication timeout."}
            </p>
          </div>

          {/* Quick Troubleshooting Steps */}
          <div className={styles.troubleshootSection}>
            <span className={styles.troubleshootTitle}>What you can do:</span>
            <ul className={styles.troubleshootList}>
              <li>
                <span className={styles.stepNum}>1</span>
                <span>Check your card balance or ensure online payments are enabled.</span>
              </li>
              <li>
                <span className={styles.stepNum}>2</span>
                <span>Try a different card, bank transfer, or USSD option on Paystack.</span>
              </li>
              <li>
                <span className={styles.stepNum}>3</span>
                <span>Contact your bank if the issue persists.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Action Buttons ─────────────────────────── */}
        <div className={styles.actionsGroup}>
          <button
            type="button"
            onClick={onEditDetails}
            className={styles.btnSecondary}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Change Details</span>
          </button>

          <button
            type="button"
            onClick={onRetry}
            className={styles.btnPrimary}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Payment Again</span>
          </button>
        </div>

        {/* ── Assistance Note ────────────────────────── */}
        <div className={styles.supportFooter}>
          <HelpCircle className="w-4 h-4 text-[#868C98]" />
          <span>
            Need help? Contact our donor support team at{" "}
            <a
              href="mailto:support@royzhouz.com"
              className="text-[#B46A2C] font-semibold underline underline-offset-2 hover:text-[#995222]"
            >
              support@royzhouz.com
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailure;
