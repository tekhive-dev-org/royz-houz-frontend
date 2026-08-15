import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";
import { MediaPagination } from "../MediaPagination/MediaPagination";
import styles from "./MediaVideos.module.css";

/**
 * MediaVideos component displaying 3-column grid of featured video showcases,
 * supporting both compact section mode and full paginated catalog view.
 */
export function MediaVideos({
  videos,
  onVideoClick,
  onViewAll,
  isFullView = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(9);

  if (!videos || videos.length === 0) return null;

  // Pagination logic when in full view
  const totalPages = Math.ceil(videos.length / perPage) || 1;
  const displayedVideos = isFullView
    ? videos.slice((currentPage - 1) * perPage, currentPage * perPage)
    : videos.slice(0, 3);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePerPageChange = (count) => {
    setPerPage(count);
    setCurrentPage(1);
  };

  return (
    <section className={styles.section} aria-labelledby="videos-heading">
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleRow}>
            <div className={styles.accentBar} aria-hidden="true" />
            <h2 id="videos-heading" className={styles.title}>
              {isFullView ? "Latest Videos" : "Videos"}
            </h2>
          </div>

          {!isFullView && (
            <Link
              href="/media?tab=videos"
              onClick={(e) => {
                if (onViewAll) {
                  e.preventDefault();
                  onViewAll("videos");
                }
              }}
              className={styles.viewAllLink}
            >
              <span>View all videos</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        <p className={styles.subtitle}>
          Watch Inspiring stories, performance, interviews and more.
        </p>
      </div>

      {/* 3-Column Video Cards Grid */}
      <div className={styles.grid}>
        {displayedVideos.map((video) => (
          <article
            key={video.id}
            onClick={() => onVideoClick?.(video)}
            className={styles.videoCard}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onVideoClick?.(video);
              }
            }}
          >
            {/* Thumbnail Wrapper */}
            <div className={styles.thumbnailWrapper}>
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={styles.thumbnailImg}
              />
              <div className={styles.thumbnailOverlay} />

              {/* Center Play Button Overlay */}
              <div className={styles.playBtnOverlay}>
                <div className={styles.playIconCircle}>
                  <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                </div>
              </div>

              {/* Duration Badge */}
              <span className={styles.durationBadge}>{video.duration}</span>
            </div>

            {/* Video Content */}
            <div className={styles.cardContent}>
              <div className={styles.titleGroup}>
                <h3 className={styles.cardTitle}>{video.title}</h3>
                <p className={styles.cardSubtitle}>{video.subtitle}</p>
              </div>

              {/* Author & Meta Stack */}
              <div className={styles.authorRow}>
                {video.author && (
                  <div className={styles.authorContainer}>
                    <div className={styles.avatarWrapper}>
                      <Image
                        src={video.author.avatar}
                        alt={video.author.name}
                        fill
                        sizes="32px"
                        className={styles.avatar}
                      />
                    </div>
                    <div className={styles.authorDetails}>
                      <span className={styles.authorName}>
                        {video.author.name}
                      </span>
                      <div className={styles.metaStats}>
                        <span>{video.views}</span>
                        <span>{video.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination (visible when in full catalog view) */}
      {isFullView && (
        <MediaPagination
          currentPage={currentPage}
          totalPages={totalPages}
          perPage={perPage}
          onPageChange={handlePageChange}
          onPerPageChange={handlePerPageChange}
        />
      )}
    </section>
  );
}

export default MediaVideos;
