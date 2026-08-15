import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, ChevronRight } from "lucide-react";
import { MediaPagination } from "../MediaPagination/MediaPagination";
import { MEDIA_BEYOND_SPOTLIGHT_PODCASTS } from "@/constants/media";
import styles from "./MediaPodcasts.module.css";

/**
 * MediaPodcasts component displaying featured podcast episodes with interactive audio/video triggers,
 * supporting both compact section mode and full paginated catalog view with "Beyond the Spotlight".
 */
export function MediaPodcasts({
  podcasts,
  onPodcastClick,
  onViewAll,
  isFullView = false,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(6);

  if (!podcasts || podcasts.length === 0) return null;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePerPageChange = (count) => {
    setPerPage(count);
    setCurrentPage(1);
  };

  // If in dedicated full podcast catalog view (/media?tab=podcasts)
  if (isFullView) {
    return (
      <div className={styles.fullPodcastsContainer}>
        {/* ── 1. Beyond the Spotlight ─────────────────────────── */}
        <section className={styles.section} aria-labelledby="beyond-spotlight-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.headerTop}>
              <div className={styles.titleRow}>
                <div className={styles.accentBar} aria-hidden="true" />
                <h2 id="beyond-spotlight-heading" className={styles.title}>
                  Beyond the Spotlight
                </h2>
              </div>
            </div>
            <p className={styles.subtitle}>
              Hear the untold stories, creative journeys, and perspectives behind Africa&apos;s most inspiring voices.
            </p>
          </div>

          {/* 3 Featured Spotlight Video Cards */}
          <div className={styles.beyondGrid}>
            {MEDIA_BEYOND_SPOTLIGHT_PODCASTS.map((item) => (
              <article
                key={item.id}
                onClick={() => onPodcastClick?.(item)}
                className={styles.beyondCard}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPodcastClick?.(item);
                  }
                }}
              >
                {/* Video Thumbnail with Play Button */}
                <div className={styles.beyondThumbWrapper}>
                  <Image
                    src={item.thumbnail}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className={styles.beyondThumbImg}
                  />
                  <div className={styles.beyondPlayOverlay}>
                    <div className={styles.beyondPlayCircle}>
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Video Details */}
                <div className={styles.beyondContent}>
                  <span className={styles.categoryPill}>{item.category}</span>
                  <h3 className={styles.beyondTitle}>{item.title}</h3>
                  <div className={styles.beyondMetaRow}>
                    <span className={styles.beyondHost}>{item.host}</span>
                    <span className={styles.beyondDuration}>{item.duration}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── 2. Podcasts (6 Episode Cards Grid) ─────────────── */}
        <section className={styles.section} aria-labelledby="podcasts-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.headerTop}>
              <div className={styles.titleRow}>
                <div className={styles.accentBar} aria-hidden="true" />
                <h2 id="podcasts-heading" className={styles.title}>
                  Podcasts
                </h2>
              </div>
            </div>
            <p className={styles.subtitle}>
              Conversations that inform, inspire and empower creatives.
            </p>
          </div>

          {/* 3-Column x 2-Row Episode Cards */}
          <div className={styles.grid}>
            {podcasts
              .slice((currentPage - 1) * perPage, currentPage * perPage)
              .map((podcast) => (
                <article
                  key={podcast.id}
                  onClick={() => onPodcastClick?.(podcast)}
                  className={styles.podcastCard}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onPodcastClick?.(podcast);
                    }
                  }}
                >
                  {/* Podcast Cover / Thumbnail */}
                  <div className={styles.coverWrapper}>
                    <Image
                      src={podcast.thumbnail}
                      alt={podcast.title}
                      fill
                      sizes="(max-width: 768px) 130px, 150px"
                      className={styles.coverImg}
                    />
                    <div className={styles.playOverlay}>
                      <div className={styles.playIconCircle}>
                        <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                      </div>
                    </div>
                    <span className={styles.durationBadge}>{podcast.duration}</span>
                  </div>

                  {/* Podcast Details */}
                  <div className={styles.details}>
                    <div className={styles.titleGroup}>
                      <h3 className={styles.podcastTitle}>{podcast.title}</h3>
                      <p className={styles.podcastDesc}>{podcast.description}</p>
                    </div>

                    <div className={styles.authorDetails}>
                      <span className={styles.hostName}>{podcast.host}</span>
                      <div className={styles.metaStats}>
                        <span>{podcast.views}</span>
                        <span>{podcast.publishedAt}</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
          </div>

          {/* Pagination */}
          <MediaPagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(podcasts.length / perPage))}
            perPage={perPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
        </section>
      </div>
    );
  }

  // Compact Overview Layout for "All Media" Tab
  const displayedPodcasts = podcasts.slice(0, 3);

  return (
    <section className={styles.section} aria-labelledby="podcasts-heading">
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleRow}>
            <div className={styles.accentBar} aria-hidden="true" />
            <h2 id="podcasts-heading" className={styles.title}>
              Podcasts
            </h2>
          </div>

          <Link
            href="/media?tab=podcasts"
            onClick={(e) => {
              if (onViewAll) {
                e.preventDefault();
                onViewAll("podcasts");
              }
            }}
            className={styles.viewAllLink}
          >
            <span>View all podcasts</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <p className={styles.subtitle}>
          Conversations that matter – hear from creators and creatives.
        </p>
      </div>

      {/* 3-Column Podcast Cards */}
      <div className={styles.grid}>
        {displayedPodcasts.map((podcast) => (
          <article
            key={podcast.id}
            onClick={() => onPodcastClick?.(podcast)}
            className={styles.podcastCard}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPodcastClick?.(podcast);
              }
            }}
          >
            {/* Podcast Cover / Thumbnail */}
            <div className={styles.coverWrapper}>
              <Image
                src={podcast.thumbnail}
                alt={podcast.title}
                fill
                sizes="(max-width: 768px) 130px, 150px"
                className={styles.coverImg}
              />
              <div className={styles.playOverlay}>
                <div className={styles.playIconCircle}>
                  <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                </div>
              </div>
              <span className={styles.durationBadge}>{podcast.duration}</span>
            </div>

            {/* Podcast Details */}
            <div className={styles.details}>
              <div className={styles.titleGroup}>
                <h3 className={styles.podcastTitle}>{podcast.title}</h3>
                <p className={styles.podcastDesc}>{podcast.description}</p>
              </div>

              <div className={styles.authorDetails}>
                <span className={styles.hostName}>{podcast.host}</span>
                <div className={styles.metaStats}>
                  <span>{podcast.views}</span>
                  <span>{podcast.publishedAt}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default MediaPodcasts;
