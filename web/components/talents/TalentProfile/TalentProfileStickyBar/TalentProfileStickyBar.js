import styles from "./TalentProfileStickyBar.module.css";

/**
 * TalentProfileStickyBar component with quick action buttons.
 */
export function TalentProfileStickyBar({ talent, onBookClick, onShareClick }) {
  // const [isFollowing, setIsFollowing] = useState(false);

  return (
    <div className={styles.bar} role="toolbar" aria-label="Talent Quick Actions">
      <div className={styles.container}>
        {/* Talent Signature/Name */}
        <span className={styles.signature}>{talent.name}</span>

        {/* Action Controls */}
        <div className={styles.actions}>
          {/* <button
            type="button"
            onClick={() => setIsFollowing(!isFollowing)}
            className={styles.btnSecondary}
            aria-pressed={isFollowing}
          >
            {isFollowing ? "Following" : "+ Follow"}
          </button> */}

          <button
            type="button"
            onClick={onShareClick}
            className={styles.btnSecondary}
            aria-label="Share profile"
          >
            Share
          </button>

          <button
            type="button"
            onClick={onBookClick}
            className={styles.btnPrimary}
          >
            Book Talent
          </button>
        </div>
      </div>
    </div>
  );
}

export default TalentProfileStickyBar;
