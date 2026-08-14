import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import styles from "./TalentProfileTabs.module.css";

/**
 * VideosTab component rendering a 3-column video showcase navigating to the Producer Video Player page.
 */
export function VideosTab({ talent }) {
  const defaultVideos = [
    {
      id: "the-sound-architect",
      title: "Full Performance at Barbican Calabar",
      artist: talent?.name || "Fatima Osei",
      duration: "28:00",
      thumbnail: "/assets/img/talents/fatima.jpg",
    },
    {
      id: "v2",
      title: "Full Performance at Barbican Calabar",
      artist: talent?.name || "Fatima Osei",
      duration: "28:00",
      thumbnail: "/assets/img/talents/julius.jpg",
    },
    {
      id: "v3",
      title: "Full Performance at Barbican Calabar",
      artist: talent?.name || "Fatima Osei",
      duration: "28:00",
      thumbnail: "/assets/img/talents/headphones.jpg",
    },
    {
      id: "v4",
      title: "Full Performance at Barbican Calabar",
      artist: talent?.name || "Fatima Osei",
      duration: "28:00",
      thumbnail: "/assets/img/talents/studio.jpg",
    },
    {
      id: "production-reel",
      title: "Full Performance at Barbican Calabar",
      artist: talent?.name || "Fatima Osei",
      duration: "28:00",
      thumbnail: "/assets/img/talents/producer-hero.jpg",
    },
    {
      id: "v6",
      title: "Full Performance at Barbican Calabar",
      artist: talent?.name || "Fatima Osei",
      duration: "28:00",
      thumbnail: "/assets/img/talents/kofi.jpg",
    },
    {
      id: "v7",
      title: "Full Performance at Barbican Calabar",
      artist: talent?.name || "Fatima Osei",
      duration: "28:00",
      thumbnail: "/assets/img/talents/amara.jpg",
    },
  ];

  const videos = talent?.videos || defaultVideos;
  const talentSlug = talent?.slug || talent?.id || "julius-ayomide";

  return (
    <div role="tabpanel" aria-label="Talent Videos">
      {/* 3-Column Video Showcase Grid */}
      <div className={styles.videoGrid}>
        {videos.map((vid) => {
          const videoUrl = `/talents/${talentSlug}/video/${vid.id || "the-sound-architect"}`;

          return (
            <Link
              key={vid.id || vid.title}
              href={videoUrl}
              className={styles.videoCard}
              aria-label={`Watch ${vid.title}`}
            >
              {/* Background Thumbnail Photography */}
              <Image
                src={vid.thumbnail}
                alt={vid.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className={styles.videoImage}
              />

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
                  <p className={styles.videoArtist}>{vid.artist}</p>
                  <span className={styles.videoDuration}>{vid.duration}</span>
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
