import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Pause, ChevronRight } from "lucide-react";
import { MediaPagination } from "../MediaPagination/MediaPagination";
import {
  MEDIA_DISCOVER_SOUNDS,
  MEDIA_ALL_MUSIC_TRACKS,
} from "@/constants/media";
import styles from "./MediaMusic.module.css";

/**
 * MediaMusic component displaying Music Spotlight and Discover New Sounds sections,
 * supporting both compact section mode and full paginated music catalog view.
 */
export function MediaMusic({
  musicData,
  onMusicClick,
  onViewAll,
  isFullView = false,
}) {
  const [activeTrackId, setActiveTrackId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(8);

  const handleTrackAction = (track) => {
    setActiveTrackId((prev) => (prev === track.id ? null : track.id));
    if (onMusicClick) {
      onMusicClick(track);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePerPageChange = (count) => {
    setPerPage(count);
    setCurrentPage(1);
  };

  // If in dedicated full music catalog view (/media?tab=music)
  if (isFullView) {
    return (
      <div className={styles.fullMusicContainer}>
        {/* ── 1. Discover New Sounds ─────────────────────────── */}
        <section className={styles.section} aria-labelledby="discover-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.headerTop}>
              <div className={styles.titleRow}>
                <div className={styles.accentBar} aria-hidden="true" />
                <h2 id="discover-heading" className={styles.title}>
                  Discover New Sounds
                </h2>
              </div>
            </div>
            <p className={styles.subtitle}>
              Explore emerging voices and unique sounds shaping evolving music scene.
            </p>
          </div>

          {/* 3 Full-Bleed Discover Cards */}
          <div className={styles.discoverGrid}>
            {MEDIA_DISCOVER_SOUNDS.map((item) => (
              <div
                key={item.id}
                onClick={() => handleTrackAction(item)}
                className={styles.discoverCard}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleTrackAction(item);
                  }
                }}
              >
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className={styles.discoverImg}
                />
                <div className={styles.discoverOverlay} />

                <div className={styles.discoverBottomContent}>
                  <h3 className={styles.discoverTitle}>{item.title}</h3>
                  <p className={styles.discoverGenre}>{item.genre}</p>
                  <p className={styles.discoverArtist}>{item.artist}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. Music Spotlight (8 Tracks in 4 Columns) ────── */}
        <section className={styles.section} aria-labelledby="music-spotlight-heading">
          <div className={styles.sectionHeader}>
            <div className={styles.headerTop}>
              <div className={styles.titleRow}>
                <div className={styles.accentBar} aria-hidden="true" />
                <h2 id="music-spotlight-heading" className={styles.title}>
                  Music Spotlight
                </h2>
              </div>
            </div>
            <p className={styles.subtitle}>
              Go beyond the spotlight and discover the people this creative excellence.
            </p>
          </div>

          {/* 4-Column Track Cards Grid */}
          <div className={styles.fullTracksGrid}>
            {MEDIA_ALL_MUSIC_TRACKS.slice(
              (currentPage - 1) * perPage,
              currentPage * perPage
            ).map((track) => {
              const isPlaying = activeTrackId === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackAction(track)}
                  className={`${styles.trackCard} ${
                    isPlaying ? styles.trackCardActive : ""
                  }`}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleTrackAction(track);
                    }
                  }}
                >
                  {/* Track Thumbnail */}
                  <div className={styles.trackThumbWrapper}>
                    <Image
                      src={track.coverImage}
                      alt={track.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className={styles.trackThumb}
                    />
                    <div className={styles.trackThumbOverlay}>
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-white text-white" />
                      ) : (
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className={styles.trackInfo}>
                    <h4 className={styles.trackTitle}>{track.title}</h4>
                    <p className={styles.trackGenre}>{track.genre}</p>
                    <p className={styles.trackArtist}>{track.artist}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <MediaPagination
            currentPage={currentPage}
            totalPages={Math.max(
              1,
              Math.ceil(MEDIA_ALL_MUSIC_TRACKS.length / perPage)
            )}
            perPage={perPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
        </section>
      </div>
    );
  }

  // Compact Overview Layout for "All Media" Tab
  if (!musicData) return null;
  const { featuredTrack, tracks } = musicData;

  return (
    <section className={styles.section} aria-labelledby="music-heading">
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div className={styles.headerTop}>
          <div className={styles.titleRow}>
            <div className={styles.accentBar} aria-hidden="true" />
            <h2 id="music-heading" className={styles.title}>
              Music Spotlight
            </h2>
          </div>

          <Link
            href="/media?tab=music"
            onClick={(e) => {
              if (onViewAll) {
                e.preventDefault();
                onViewAll("music");
              }
            }}
            className={styles.viewAllLink}
          >
            <span>View all music</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <p className={styles.subtitle}>
          Explore original sounds, studio tracks, and upcoming artist releases.
        </p>
      </div>

      {/* Main Music Layout */}
      <div className={styles.musicLayout}>
        {/* Left: Featured Track Card */}
        {featuredTrack && (
          <div
            className={styles.featuredCard}
            onClick={() => handleTrackAction(featuredTrack)}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleTrackAction(featuredTrack);
              }
            }}
          >
            <div className={styles.featuredCoverWrapper}>
              <Image
                src={featuredTrack.coverImage}
                alt={featuredTrack.title}
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className={styles.featuredCoverImg}
              />
              <div className={styles.featuredCoverOverlay} />

              <div className={styles.featuredBottomContent}>
                <h3 className={styles.featuredTitle}>{featuredTrack.title}</h3>
                <p className={styles.featuredGenre}>{featuredTrack.genre}</p>
                <p className={styles.featuredArtist}>{featuredTrack.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Right: 6-Track Grid */}
        <div className={styles.tracksGrid}>
          {tracks?.map((track) => {
            const isPlaying = activeTrackId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => handleTrackAction(track)}
                className={`${styles.trackCard} ${
                  isPlaying ? styles.trackCardActive : ""
                }`}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleTrackAction(track);
                  }
                }}
              >
                {/* Track Thumbnail */}
                <div className={styles.trackThumbWrapper}>
                  <Image
                    src={track.coverImage}
                    alt={track.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 220px"
                    className={styles.trackThumb}
                  />
                  <div className={styles.trackThumbOverlay}>
                    {isPlaying ? (
                      <Pause className="w-4 h-4 fill-white text-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                    )}
                  </div>
                </div>

                {/* Track Info */}
                <div className={styles.trackInfo}>
                  <h4 className={styles.trackTitle}>{track.title}</h4>
                  <p className={styles.trackGenre}>{track.genre}</p>
                  <p className={styles.trackArtist}>{track.artist}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default MediaMusic;
