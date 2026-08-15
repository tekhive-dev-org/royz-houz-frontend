import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";
import styles from "./TalentApplication.module.css";

/**
 * Success Confirmation Modal shown after successful application submission.
 */
export function ApplicationSuccessModal({
  isOpen,
  referenceId = `RH-APP-${Math.floor(100000 + Math.random() * 900000)}`,
  applicantName = "Creative Artist",
}) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.successModalCard}>
        <div className={styles.successIconCircle}>
          <CheckCircle2 className="w-12 h-12 text-[#B46A2C]" />
        </div>

        <h3 className={styles.successTitle}>Application Submitted!</h3>
        <p className={styles.successSubtitle}>
          Thank you, <strong className="text-[#0A0D14]">{applicantName}</strong>. Your talent
          application has been received by the Royz Houz talent scouting team.
        </p>

        <div className={styles.refCodeBox}>
          <span className={styles.refCodeLabel}>Application Reference ID</span>
          <span className={styles.refCodeValue}>{referenceId}</span>
        </div>

        <p className={styles.successHelper}>
          Our team will review your profile, socials, and work samples. We will contact you via
          email and phone within 5–7 business days.
        </p>

        <div className={styles.successActionsRow}>
          <Link href="/talents" className={styles.successSecondaryBtn}>
            <span>Explore Talents</span>
          </Link>

          <Link href="/" className={styles.successPrimaryBtn}>
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ApplicationSuccessModal;
