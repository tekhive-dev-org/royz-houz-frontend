import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import styles from "./TalentProfileTabs.module.css";
import {
  getTalentMediaPath,
  getTalentVideos,
} from "@/components/talents/TalentVideoPlayer/talentVideoUtils";

/**
 * VideosTab component rendering a 3-column video showcase navigating to the Producer Video Player page.
 */
export function VideosTab({ talent }) {
  const videos = getTalentVideos(talent);
  return (
    <div role="tabpanel" aria-label="Talent Videos">
      {/* 3-Column Video Showcase Grid */}
      <div className={styles.videoGrid}>
        {videos.map((vid) => {
          const videoUrl = getTalentMediaPath(talent, vid);

          return (
            <Link
              key={vid.id || vid.title}
              href={videoUrl || "#"}
              onClick={(event) => {
                if (!videoUrl) event.preventDefault();
              }}
              aria-disabled={!videoUrl}
              className={styles.videoCard}
              aria-label={`Watch ${vid.title || "video"}`}
            >
              {/* Background Thumbnail Photography */}
              {vid.thumbnail ? (
                <Image
                  src={vid.thumbnail}
                  alt={vid.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className={styles.videoImage}
                />
              ) : null}

              {/* Gradient Overlay & Card Elements */}
              <div className={styles.videoOverlay}>
                {/* Top Spacer / Empty */}
                <div />

                {/* Center Play Icon Circle */}
                <div className={styles.playCenterWrapper}>
                  <div className={styles.playCircleBtn} aria-hidden="true">
                    <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Bottom Content Row */}
                <div className={styles.videoBottomInfo}>
                  <h4 className={styles.videoTitle}>{vid.title}</h4>
                  <p className={styles.videoArtist}>
                    {vid.artist || talent?.name}
                  </p>
                  {vid.duration ? (
                    <span className={styles.videoDuration}>{vid.duration}</span>
                  ) : null}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default VideosTab;
