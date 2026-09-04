import Image from "next/image";
import Link from "next/link";
import { formatBannerDuration, formatDisplayDuration } from "@/adapters/mediaAdapter";
import { partitionTalentVideoQueue } from "./talentVideoUtils";
import styles from "./TalentVideoPlayer.module.css";

function getItemSubtitle(item) {
  if (item.mediaType === "music") {
    return item.artist || item.producer || item.plays || item.streams || "Track";
  }
  return item.artist || "";
}

function getItemDuration(item) {
  if (!item?.duration) return "";
  return formatBannerDuration(item.duration) || formatDisplayDuration(item.duration) || String(item.duration);
}

/**
 * UpNextVideos sidebar widget rendering video queue with interactive playback selection.
 */
export function UpNextVideos({
  videos = [],
  activeVideoId,
  onSelectVideo,
}) {
  const { currentVideo, upcomingVideos } = partitionTalentVideoQueue(videos, activeVideoId);

  return (
    <div className={styles.upNextCard} aria-label="Up next playback queue">
      {currentVideo ? (
        <section className={styles.nowPlayingSection} aria-label="Currently playing video">
          <span className={styles.nowPlayingHeading}>Now Playing</span>
          <div className={styles.nowPlayingItem}>
            <div className={styles.nowPlayingLeft}>
              <div className={styles.nowPlayingThumb}>
                {currentVideo.thumbnail ? (
                  <Image
                    src={currentVideo.thumbnail}
                    alt={currentVideo.title}
                    fill
                    sizes="56px"
                    className="object-cover object-center"
                  />
                ) : null}
              </div>
              <div className={styles.nowPlayingDetails}>
                <span className={styles.nowPlayingTitle} title={currentVideo.title}>
                  {currentVideo.title}
                </span>
                <span className={styles.nowPlayingArtist}>
                  {getItemSubtitle(currentVideo)}
                </span>
                <span className={styles.nowPlayingLabel}>
                  <span className={styles.nowPlayingPulse} />
                  Playing now
                </span>
              </div>
            </div>
            {getItemDuration(currentVideo) ? (
              <span className={styles.nowPlayingDuration}>
                {getItemDuration(currentVideo)}
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className={styles.queueHeadingRow}>
        <h3 className={styles.queueHeading}>Up Next</h3>
        <span className={styles.queueCount}>{upcomingVideos.length}</span>
      </div>

      {upcomingVideos.length ? (
        <div className={styles.upNextList}>
          {upcomingVideos.map((vid) => (
            <Link
              key={vid.id}
              href={vid.href || "#"}
              onClick={(event) => {
                if (onSelectVideo) {
                  event.preventDefault();
                  onSelectVideo(vid);
                }
              }}
              className={styles.upNextItem}
            >
              <div className={styles.upNextLeft}>
                <div className={styles.upNextThumb}>
                  {vid.thumbnail ? (
                    <Image
                      src={vid.thumbnail}
                      alt={vid.title}
                      fill
                      sizes="48px"
                      className="object-cover object-center"
                    />
                  ) : null}
                </div>
                <div className={styles.upNextDetails}>
                  <span className={styles.upNextTitle}>{vid.title}</span>
                  <span className={styles.upNextArtist}>{getItemSubtitle(vid)}</span>
                </div>
              </div>
              {getItemDuration(vid) ? (
                <span className={styles.upNextDuration}>{getItemDuration(vid)}</span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.upNextEmpty}>You&apos;ve reached the end of this playlist.</p>
      )}
    </div>
  );
}

export default UpNextVideos;
