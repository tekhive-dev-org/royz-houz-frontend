import { useState, useEffect } from "react";
import {
  X,
  Link as LinkIcon,
  Check,
  Twitter,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import styles from "./ShareModal.module.css";

/**
 * ShareModal component presenting interactive social share and link copying options for profiles and videos.
 */
export function ShareModal({
  isOpen = false,
  onClose,
  talent = { name: "Julius Ayomide" },
  video,
  shareType = "profile",
  title,
  subtitle,
  customUrl,
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
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

  const isVideoShare = shareType === "video" || Boolean(video);

  const defaultUrl = isVideoShare
    ? `https://royzhouz.com/talents/${talent.slug || talent.id || "talent"}/video/${video?.id || "reel"}`
    : `https://royzhouz.com/talents/${talent.slug || talent.id || "talent"}`;

  const currentUrl =
    customUrl ||
    (typeof window !== "undefined" ? window.location.href : defaultUrl);

  const modalTitle =
    title || (isVideoShare ? "Share Video" : "Share Profile");

  const modalSubtitle =
    subtitle ||
    (isVideoShare
      ? `Share "${video?.title || "this video"}" by ${talent.name} with your network`
      : `Share ${talent.name}'s profile with your network`);

  const shareText = isVideoShare
    ? `Check out "${video?.title || "this video"}" by ${talent.name} on RoyzHouz!`
    : `Check out ${talent.name}'s creative profile on RoyzHouz!`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(currentUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(currentUrl);
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${shareText} ${currentUrl}`);
    window.open(
      `https://api.whatsapp.com/send?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
    >
      <div
        className={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close share dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className={styles.header}>
          <h2 id="share-modal-title" className={styles.title}>
            {modalTitle}
          </h2>
          <p className={styles.subtitle}>{modalSubtitle}</p>
        </div>

        {/* Share Actions List */}
        <div className={styles.optionsList}>
          {/* Option 1: Copy Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={styles.optionBtn}
          >
            <div className={styles.optionLeft}>
              <LinkIcon className={styles.optionIcon} />
              <span>Copy Link</span>
            </div>
            {copied ? (
              <span className={styles.copySuccessBadge}>
                <Check className="w-3 h-3 inline mr-1" />
                Copied!
              </span>
            ) : null}
          </button>

          {/* Option 2: Share on X (Twitter) */}
          <button
            type="button"
            onClick={handleShareTwitter}
            className={styles.optionBtn}
          >
            <div className={styles.optionLeft}>
              <Twitter className={styles.optionIcon} />
              <span>Share on X (Twitter)</span>
            </div>
          </button>

          {/* Option 3: Share on LinkedIn */}
          <button
            type="button"
            onClick={handleShareLinkedIn}
            className={styles.optionBtn}
          >
            <div className={styles.optionLeft}>
              <Linkedin className={styles.optionIcon} />
              <span>Share on LinkedIn</span>
            </div>
          </button>

          {/* Option 4: Share on WhatsApp */}
          <button
            type="button"
            onClick={handleShareWhatsApp}
            className={styles.optionBtn}
          >
            <div className={styles.optionLeft}>
              <MessageCircle className={styles.optionIcon} />
              <span>Share on WhatsApp</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
