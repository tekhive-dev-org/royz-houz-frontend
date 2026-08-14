import { Share2, Flag } from "lucide-react";
import styles from "./TalentVideoPlayer.module.css";

/**
 * VideoPlayerMeta component rendering video title, creator info, and social action buttons.
 */
export function VideoPlayerMeta({
  title = "The Sound Architect",
  talent = { name: "Julius Ayomide" },
  onShareClick,
  onReportClick,
}) {
  return (
    <div className={styles.titleRow}>
      {/* Video Details */}
      <div>
        <h1 className={styles.videoTitle}>{title}</h1>
        <p className={styles.videoTalentName}>{talent.name}</p>
      </div>

      {/* Action Controls: Share and Report */}
      <div className={styles.actionBtnGroup}>
        <button
          type="button"
          onClick={onShareClick}
          className={styles.actionBtn}
          aria-label="Share video"
        >
          <Share2 className="w-4 h-4 text-[#666666]" />
          <span>Share</span>
        </button>

        <button
          type="button"
          onClick={onReportClick}
          className={styles.actionIconBtn}
          aria-label="Report or flag content"
          title="Report"
        >
          <Flag className="w-4 h-4 text-[#666666]" />
        </button>
      </div>
    </div>
  );
}

export default VideoPlayerMeta;
