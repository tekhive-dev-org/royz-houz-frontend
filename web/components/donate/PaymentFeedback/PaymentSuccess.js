import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  Share2,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import styles from "./PaymentSuccess.module.css";

/**
 * PaymentSuccess Component
 * Comprehensive, professional receipt and thank-you confirmation card.
 */
export function PaymentSuccess({
  donationData,
  onDonateAgain,
}) {
  const [copied, setCopied] = useState(false);

  const amountNumber = donationData?.amount || 25000;
  const formattedAmount = `₦${amountNumber.toLocaleString()}`;
  const refCode = donationData?.refCode || `RH-DON-${Math.floor(1000000 + Math.random() * 9000000)}`;
  const dateFormatted = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleCopyRef = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(refCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: "I just supported Royz House Foundation!",
          text: `I just donated ${formattedAmount} to empower young African creatives on Royz House. Join me in making an impact!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopyRef();
    }
  };

  return (
    <div className={styles.container} aria-label="Payment Successful">
      <div className={styles.card}>
        {/* ── Success Icon with Pulsing Halo ─────────── */}
        <div className={styles.iconWrapper}>
          <div className={styles.iconHalo} />
          <div className={styles.iconCircle}>
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
        </div>

        {/* ── Title & Message ────────────────────────── */}
        <div className={styles.textHeader}>
          <span className={styles.badgeSuccess}>Payment Confirmed</span>
          <h2 className={styles.title}>Thank You for Your Generosity!</h2>
          <p className={styles.subtitle}>
            Your donation has been processed successfully. An official receipt has
            been sent to{" "}
            <span className={styles.highlightEmail}>
              {donationData?.email || "donaldlawrence9@gmail.com"}
            </span>
            .
          </p>
        </div>

        {/* ── Official Transaction Receipt Box ───────── */}
        <div className={styles.receiptBox}>
          <div className={styles.receiptTop}>
            <div>
              <span className={styles.receiptLabel}>Total Amount Donated</span>
              <div className={styles.amountDisplay}>{formattedAmount}</div>
            </div>
            <div className={styles.refWrap}>
              <span className={styles.receiptLabel}>Transaction Reference</span>
              <button
                type="button"
                onClick={handleCopyRef}
                className={styles.copyBtn}
                title="Copy reference code"
              >
                <code>{refCode}</code>
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#868C98]" />
                )}
              </button>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.receiptDetailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Donor Name</span>
              <span className={styles.detailValue}>
                {donationData?.fullName || "Donald Lawrence"}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Cause Supported</span>
              <span className={styles.detailValue}>
                {donationData?.cause || "Career skill development"}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Frequency</span>
              <span className={styles.detailValue}>
                {donationData?.frequency === "one-time"
                  ? "One-Time Donation"
                  : donationData?.frequency === "monthly"
                  ? "Monthly Donation"
                  : "Sponsor a Talent"}
              </span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Payment Method</span>
              <span className={styles.detailValue}>Paystack / Card (•••• 4242)</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date &amp; Time</span>
              <span className={styles.detailValue}>{dateFormatted}</span>
            </div>

            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={styles.statusPaid}>
                <span className={styles.statusDot} /> Completed
              </span>
            </div>
          </div>
        </div>

        {/* ── Impact Banner ──────────────────────────── */}
        <div className={styles.impactBanner}>
          <HeartHandshake className="w-5 h-5 text-[#B46A2C] shrink-0 mt-0.5" />
          <p className={styles.impactText}>
            <strong>Your impact is already at work:</strong> 100% of your
            contribution goes directly towards equipment, training programs, and
            mentorship for emerging creative talents across Africa.
          </p>
        </div>

        {/* ── Action Buttons ─────────────────────────── */}
        <div className={styles.actionsGroup}>
          <button
            type="button"
            onClick={handleShare}
            className={styles.btnSecondary}
          >
            <Share2 className="w-4 h-4" />
            <span>Share Your Support</span>
          </button>

          <button
            type="button"
            onClick={onDonateAgain}
            className={styles.btnPrimary}
          >
            <span>Make Another Donation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── Footer Link ────────────────────────────── */}
        <div className={styles.footerNote}>
          <ShieldCheck className="w-4 h-4 text-[#868C98]" />
          <span>Tax-deductible contribution processed securely by Royz House.</span>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
