import { Share2, Flag, Clock, Eye, Calendar } from "lucide-react";
import { formatBannerDuration, formatDisplayDuration } from "@/adapters/mediaAdapter";
import styles from "./TalentVideoPlayer.module.css";

/**
 * VideoPlayerMeta component rendering video title, creator info, user-friendly duration,
 * metadata stats (views, category, publish date), and social action buttons.
 */
export function VideoPlayerMeta({
  title = "The Beat Behind The Hit",
  talent = { name: "John Donald" },
  media = {},
  onShareClick,
  onReportClick,
}) {
  const displayDuration =
    media?.displayDuration ||
    formatBannerDuration(media?.duration) ||
    formatDisplayDuration(media?.duration) ||
    "";
  const views = media?.views || "";
  const category = media?.category || media?.genre || "";
  const publishedAt = media?.publishedAt || "";

  return (
    <div className={styles.titleRow}>
      {/* Video Details */}
      <div className="flex-1 min-w-0">
        <h1 className={styles.videoTitle}>{title}</h1>
        <div className={styles.metaRow}>
          <p className={styles.videoTalentName}>{talent.name}</p>

          {displayDuration || category || views || publishedAt ? (
            <div className={styles.metaBadgeGroup}>
              {displayDuration ? (
                <span className={styles.metaBadge} title="Duration">
                  <Clock className="w-3.5 h-3.5 text-[#C8781A]" aria-hidden="true" />
                  <span>{displayDuration}</span>
                </span>
              ) : null}

              {category ? (
                <span className={styles.metaBadgeCategory}>{category}</span>
              ) : null}

              {views ? (
                <span className={styles.metaBadge} title="Views">
                  <Eye className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>{views}</span>
                </span>
              ) : null}

              {publishedAt ? (
                <span className={styles.metaBadge} title="Published date">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                  <span>{publishedAt}</span>
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
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
