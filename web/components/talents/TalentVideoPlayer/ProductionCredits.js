import { useState } from "react";
import styles from "./TalentVideoPlayer.module.css";

/**
 * ProductionCredits component rendering category-specific portfolio / tracklist table.
 * Adapts dynamically for Musicians (Playlist), Actors (Filmography), Dancers (Performance Reel),
 * Influencers (Content Portfolio), Writers (Writing Portfolio), and Producers (Production Credits).
 */
export function ProductionCredits({
  talent = { name: "Julius Ayomide" },
  title,
  badge,
  tracks,
  activeTrackId: controlledActiveId,
  onSelectTrack,
}) {
  // Determine default portfolio items from talent data or category
  const portfolioItems =
    tracks ||
    talent.videoReel?.portfolioItems ||
    talent.musicTracks || [
      {
        id: 1,
        title: "One Africa",
        subtitle: "Produced by Julius Ayomide • 980K plays",
        duration: "3:42",
        isActive: true,
      },
      {
        id: 2,
        title: "Vibes & Patterns",
        subtitle: "Produced by Julius Ayomide • 1.2M plays",
        duration: "4:01",
      },
      {
        id: 3,
        title: "No Pressure",
        subtitle: "Produced by Julius Ayomide • 756K plays",
        duration: "3:28",
      },
      {
        id: 4,
        title: "Midnight Calling",
        subtitle: "Produced by Julius Ayomide • 512K plays",
        duration: "4:18",
      },
    ];

  // Default active track is either the item marked isActive or index 0
  const initialActive =
    portfolioItems.find((item) => item.isActive)?.id ||
    portfolioItems[0]?.id ||
    1;
  const [internalActiveId, setInternalActiveId] = useState(initialActive);

  const activeTrackId =
    controlledActiveId !== undefined ? controlledActiveId : internalActiveId;

  const handleTrackClick = (track) => {
    setInternalActiveId(track.id);
    if (onSelectTrack) {
      onSelectTrack(track);
    }
  };

  // Compute category-specific header title and count badge
  const categoryUpper = (talent.category || "").toUpperCase();
  const categoryKey = (talent.categoryKey || "").toLowerCase();

  const getComputedTitle = () => {
    if (title) return title;
    if (talent.videoReel?.portfolioTitle) return talent.videoReel.portfolioTitle;
    if (categoryUpper === "MUSICIAN" || categoryKey === "musicians") {
      return `Playlist — ${talent.name}`;
    }
    if (categoryUpper === "ACTOR" || categoryKey === "actors") {
      return `Filmography — ${talent.name}`;
    }
    if (categoryUpper === "DANCER" || categoryKey === "dancers") {
      return `${talent.name} — Performance Reel`;
    }
    if (categoryUpper === "INFLUENCER" || categoryKey === "influencers") {
      return `Content Portfolio — ${talent.name}`;
    }
    if (categoryUpper === "WRITER" || categoryKey === "writers") {
      return `Writing Portfolio — ${talent.name}`;
    }
    return `Production Credits — ${talent.name}`;
  };

  const getComputedBadge = () => {
    if (badge) return badge;
    if (talent.videoReel?.portfolioBadge) return talent.videoReel.portfolioBadge;
    if (categoryUpper === "MUSICIAN" || categoryKey === "musicians") {
      return `${portfolioItems.length} tracks`;
    }
    if (categoryUpper === "ACTOR" || categoryKey === "actors") {
      return `${portfolioItems.length} dramas`;
    }
    if (categoryUpper === "DANCER" || categoryKey === "dancers") {
      return `${portfolioItems.length} items`;
    }
    if (categoryUpper === "INFLUENCER" || categoryKey === "influencers") {
      return `${portfolioItems.length} items`;
    }
    if (categoryUpper === "WRITER" || categoryKey === "writers") {
      return `${portfolioItems.length} portfolios`;
    }
    return `${portfolioItems.length} productions`;
  };

  return (
    <div className={styles.creditsCard} aria-label="Portfolio & Production List">
      {/* Header Bar */}
      <div className={styles.creditsHeader}>
        <h2 className={styles.creditsTitle}>{getComputedTitle()}</h2>
        <span className={styles.creditsCount}>{getComputedBadge()}</span>
      </div>

      {/* Tracks / Filmography / Portfolio List */}
      <div className={styles.trackList} role="list">
        {portfolioItems.map((track, idx) => {
          const isActive = activeTrackId === track.id;
          const displaySubtitle =
            track.subtitle ||
            (track.producer && track.plays
              ? `${track.producer} • ${track.plays}`
              : track.plays || track.role || track.genre || "");

          return (
            <div
              key={track.id || idx}
              onClick={() => handleTrackClick(track)}
              className={`${styles.trackItem} ${
                isActive ? styles.trackItemActive : ""
              }`}
              role="listitem"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTrackClick(track);
                }
              }}
            >
              {/* Left Column (Index / Equalizer + Title / Subtitle Meta) */}
              <div className={styles.trackLeft}>
                {isActive ? (
                  <div
                    className={styles.equalizerIcon}
                    aria-label="Now playing"
                  >
                    <span className={`${styles.equalizerBar} h-2.5`} />
                    <span className={`${styles.equalizerBar} h-4`} />
                    <span className={`${styles.equalizerBar} h-2`} />
                    <span className={`${styles.equalizerBar} h-3`} />
                  </div>
                ) : (
                  <span className={styles.trackNumber}>{idx + 1}</span>
                )}

                <div className={styles.trackInfo}>
                  <span
                    className={
                      isActive ? styles.trackNameActive : styles.trackName
                    }
                  >
                    {track.title}
                  </span>
                  {displaySubtitle ? (
                    <span className={styles.trackMeta}>{displaySubtitle}</span>
                  ) : null}
                </div>
              </div>

              {/* Right Column (Duration / Read Time) */}
              <span className={styles.trackDuration}>
                {track.duration || track.readTime || ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProductionCredits;
