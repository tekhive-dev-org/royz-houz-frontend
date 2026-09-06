import { useEffect, useState } from "react";
import { ArrowRight, Check, Copy, Mail, Ticket, X } from "lucide-react";
import styles from "./PaymentModals.module.css";

export function PaymentSuccessModal({ isOpen, onClose, orderData, onDownloadTicket }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) onClose?.();
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

  const reference = orderData?.reference || "—";
  const customer = orderData?.customer || orderData?.formData || {};
  const attendeeName = [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Ticket holder";
  const attendeeEmail = customer.email || "your email address";
  const tierName = orderData?.tier?.name || orderData?.tierName || "Event ticket";
  const quantity = orderData?.quantity || 1;
  const eventTitle = orderData?.eventTitle || "Your RoyzHouz event";
  const amount = orderData?.grandTotal ?? (Number(orderData?.amountKobo) ? Number(orderData.amountKobo) / 100 : null);

  async function copyReference() {
    if (!reference || reference === "—") return;
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
      <div className={`${styles.modalCard} ${styles.successCard}`} onClick={(event) => event.stopPropagation()}>
        <div className={styles.successGlow} aria-hidden="true" />
        <button type="button" onClick={onClose} className={styles.closeBtn} aria-label="Close confirmation">
          <X className="h-5 w-5" />
        </button>

        <div className={styles.successIconWrapper} aria-hidden="true">
          <div className={styles.successIconInner}><Check className="h-8 w-8 stroke-3" /></div>
        </div>

        <div className={styles.headerContent}>
          <span className={styles.successEyebrow}>PAYMENT CONFIRMED</span>
          <h2 id="success-modal-title" className={styles.modalTitle}>You&apos;re all set.</h2>
          <p className={styles.modalSubtitle}>
            Your place at <strong>{eventTitle}</strong> is secured. Your confirmation has been sent to <span className={styles.highlightText}>{attendeeEmail}</span>.
          </p>
        </div>

        <div className={styles.ticketReceipt}>
          <div className={styles.ticketReceiptTop}>
            <div className={styles.ticketMark}><Ticket className="h-5 w-5" /></div>
            <div>
              <span className={styles.ticketLabel}>YOUR TICKET</span>
              <strong className={styles.ticketEvent}>{eventTitle}</strong>
            </div>
            <span className={styles.paidBadge}><Check className="h-3 w-3" /> PAID</span>
          </div>
          <div className={styles.ticketPerforation} aria-hidden="true" />
          <div className={styles.ticketGrid}>
            <div><span className={styles.receiptLabel}>ATTENDEE</span><strong>{attendeeName}</strong></div>
            <div><span className={styles.receiptLabel}>TICKET TYPE</span><strong>{tierName} × {quantity}</strong></div>
            <div><span className={styles.receiptLabel}>AMOUNT PAID</span><strong>{amount === null ? "Confirmed" : `₦${Number(amount).toLocaleString("en-NG")}`}</strong></div>
            <div><span className={styles.receiptLabel}>REFERENCE</span><strong className={styles.ticketReference}>{reference}</strong></div>
          </div>
        </div>

        <div className={styles.confirmationNote}><Mail className="h-4 w-4" /><span>Keep your confirmation email handy when you arrive.</span></div>

        <div className={styles.actionsColumn}>
          {onDownloadTicket ? (
            <button type="button" onClick={onDownloadTicket} className={styles.primarySuccessBtn}><Ticket className="h-4 w-4" /><span>DOWNLOAD E-TICKET</span><ArrowRight className="h-4 w-4" /></button>
          ) : null}
          <button type="button" onClick={copyReference} className={styles.secondaryBtn}><Copy className="h-4 w-4" /><span>{copied ? "REFERENCE COPIED" : "COPY REFERENCE"}</span></button>
          <button type="button" onClick={onClose} className={styles.textActionBtn}>Back to event details <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessModal;
