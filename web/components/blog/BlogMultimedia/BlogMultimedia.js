import { useState } from "react";
import Image from "next/image";
import styles from "./BlogMultimedia.module.css";
import { BLOG_MULTIMEDIA } from "../../../constants/blog";
import { VideoPlayerModal } from "../../media";

/**
 * BlogMultimedia component displaying featured video and 3 distinct stacked playlist cards.
 */
export function BlogMultimedia({ multimedia }) {
  const data = multimedia?.playlist?.length || multimedia?.mainVideo?.videoUrl ? multimedia : BLOG_MULTIMEDIA;
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const playlist = data?.playlist || [];
  const currentPlaylistItem = playlist[selectedVideoIndex] || playlist[0] || {};
  const mainVideo = data?.mainVideo || {};
  const tagline = data?.sectionTagline || mainVideo.tagline || "FROM ROYZ HOUZ";
  const title = mainVideo.title || "Stories Beyond the Page";
  const subtitle =
    mainVideo.subtitle ||
    "Discover powerful stories, inspiring conversations and creative perspectives that bring the people, talent and experiences behind Royz Houz to life.";

  const handlePlayMainVideo = () => {
    setActiveVideo({
      title: mainVideo.title || "Stories Beyond the Page",
      subtitle: mainVideo.subtitle || tagline,
      videoUrl: mainVideo.videoUrl || currentPlaylistItem?.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
    setIsVideoModalOpen(true);
  };

  const handlePlayPlaylistItem = (item, idx) => {
    setSelectedVideoIndex(idx);
    setActiveVideo({
      title: item.title || `Story #${idx + 1}`,
      subtitle: `${item.category || ""} ${item.duration ? `• ${item.duration}` : ""}`.trim(),
      videoUrl: item.videoUrl || mainVideo.videoUrl || "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
    setIsVideoModalOpen(true);
  };

  return (
    <section className={styles.section} aria-label={title}>
      <div className={styles.container}>
        {/* Section Header with dual accent lines */}
        <div className={styles.headerArea}>
          <div className={styles.tagline}>
            <span className={styles.accentLine} aria-hidden="true" />
            <span className={styles.tagText}>{tagline}</span>
            <span className={styles.accentLine} aria-hidden="true" />
          </div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Video Player + 3 Stacked Cards Layout */}
        <div className={styles.mainLayout}>
          {/* Left Column: Big Video Thumbnail */}
          <div
            className={styles.videoCard}
            onClick={handlePlayMainVideo}
            role="button"
            tabIndex={0}
            aria-label="Play featured video"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePlayMainVideo();
              }
            }}
          >
            <Image
              src={mainVideo.coverImage || "/assets/img/blog/beyond-page-video.jpg"}
              alt={mainVideo.title || currentPlaylistItem?.title || "Video Story"}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className={styles.videoCoverImage}
            />
            <div className={styles.videoBackdropOverlay} />

            {/* Centered Minimalist Play Triangle */}
            <div className={styles.playButtonWrapper}>
              <svg
                width="36"
                height="42"
                viewBox="0 0 36 42"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.playTriangleSvg}
              >
                <path
                  d="M34 19.2679C35.3333 20.0377 35.3333 21.9623 34 22.7321L3.25 40.4856C1.91667 41.2554 0.250001 40.2931 0.250001 38.7535L0.250003 3.24648C0.250003 1.70688 1.91667 0.744629 3.25 1.51443L34 19.2679Z"
                  fill="white"
                />
              </svg>
            </div>
          </div>

          {/* Right Column: 3 Distinct Stacked Story Cards */}
          <div className={styles.cardsStack}>
            {playlist.map((item, idx) => {
              const isActive = idx === selectedVideoIndex;

              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onClick={() => handlePlayPlaylistItem(item, idx)}
                  className={`${styles.storyCard} ${
                    isActive ? styles.storyCardActive : styles.storyCardInactive
                  }`}
                  aria-label={`Play ${item.title}`}
                >
                  {/* Card Title */}
                  <div className={styles.cardHeaderArea}>
                    <h3 className={`${styles.cardTitle} ${isActive ? styles.titleActive : styles.titleInactive}`}>
                      {item.title}
                    </h3>
                  </div>

                  {/* Divider Line */}
                  <div className={`${styles.cardDivider} ${isActive ? styles.dividerActive : styles.dividerInactive}`} />

                  {/* Card Bottom Meta & Play Arrow Row */}
                  <div className={styles.cardFooterArea}>
                    <div className={styles.metaLeft}>
                      <span className={`${styles.categoryText} ${isActive ? styles.categoryActive : styles.categoryInactive}`}>
                        {item.category}
                      </span>
                      <span className={`${styles.durationText} ${isActive ? styles.durationActive : styles.durationInactive}`}>
                        {item.duration}
                      </span>
                    </div>

                    {/* Vector Play Triangle */}
                    <div className={styles.playIconArea}>
                      <svg
                        width="12"
                        height="16"
                        viewBox="0 0 12 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`${styles.cardPlayTriangle} ${isActive ? styles.iconActive : styles.iconInactive}`}
                      >
                        <path
                          d="M11.376 7.419L0.777 0.353C0.548 0.2 0.237 0.262 0.084 0.492C0.029 0.574 0 0.67 0 0.769V14.9C0 15.177 0.224 15.4 0.5 15.4C0.599 15.4 0.695 15.371 0.777 15.317L11.376 8.251C11.606 8.098 11.668 7.787 11.515 7.557C11.478 7.503 11.431 7.455 11.376 7.419Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Video Player Modal */}
      {isVideoModalOpen && activeVideo && (
        <VideoPlayerModal
          isOpen={isVideoModalOpen}
          onClose={() => {
            setIsVideoModalOpen(false);
            setActiveVideo(null);
          }}
          video={activeVideo}
        />
      )}
    </section>
  );
}

export default BlogMultimedia;
