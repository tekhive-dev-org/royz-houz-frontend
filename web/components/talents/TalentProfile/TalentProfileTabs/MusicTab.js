import { useState } from "react";
import { Play, Pause } from "lucide-react";
import styles from "./TalentProfileTabs.module.css";

/**
 * MusicTab rendering interactive audio tracks with play/pause state for musicians and producers.
 */
export function MusicTab({ talent }) {
  const tracks = talent?.musicTracks || [
    {
      id: "golden-hour",
      title: "Golden Hour",
      plays: "1.2M Plays",
      duration: "3:42",
    },
    {
      id: "agba-woman",
      title: "Agba Woman",
      plays: "980K Plays",
      duration: "3:28",
    },
    {
      id: "soulfire",
      title: "Soulfire",
      plays: "750K Plays",
      duration: "3:28",
    },
    {
      id: "lagos-nights",
      title: "Lagos Nights",
      plays: "612K Plays",
      duration: "4:18",
    },
    {
      id: "california-sunset-night",
      title: "California Sunset Night",
      plays: "612K Plays",
      duration: "4:18",
    },
  ];

  const [activeTrackId, setActiveTrackId] = useState(tracks[0]?.id || "golden-hour");
  const [isPlaying, setIsPlaying] = useState(true);

  const handleTrackClick = (trackId) => {
    if (activeTrackId === trackId) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrackId(trackId);
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={styles.trackContainer}
      role="tabpanel"
      aria-label="Music Tracks"
    >
      <div className={styles.trackList}>
        {tracks.map((track, idx) => {
          const trackId = track.id || `track-${idx}`;
          const isActive = activeTrackId === trackId;
          const trackPlaying = isActive && isPlaying;

          return (
            <div
              key={trackId}
              onClick={() => handleTrackClick(trackId)}
              className={`${styles.trackCard} ${
                isActive ? styles.trackCardActive : ""
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTrackClick(trackId);
                }
              }}
              aria-label={`${trackPlaying ? "Pause" : "Play"} ${track.title}`}
            >
              {/* Left Side: Play Circle Button + Title & Plays */}
              <div className={styles.trackInfo}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTrackClick(trackId);
                  }}
                  className={`${styles.trackPlayBtn} ${
                    isActive ? styles.trackPlayBtnActive : ""
                  }`}
                  aria-label={`${trackPlaying ? "Pause" : "Play"} ${track.title}`}
                >
                  {trackPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </button>

                <div className={styles.trackDetails}>
                  <div className="flex items-center">
                    <span
                      className={`${styles.trackTitle} ${
                        isActive ? styles.trackTitleActive : ""
                      }`}
                    >
                      {track.title}
                    </span>

                    {/* Animated Equalizer on Active Track */}
                    {trackPlaying && (
                      <div
                        className={styles.trackEqualizer}
                        aria-hidden="true"
                      >
                        <span className={styles.eqBar} />
                        <span className={styles.eqBar} />
                        <span className={styles.eqBar} />
                        <span className={styles.eqBar} />
                      </div>
                    )}
                  </div>

                  <span className={styles.trackPlays}>
                    {track.plays || `${track.streams || "1M"} Plays`}
                  </span>
                </div>
              </div>

              {/* Right Side: Duration */}
              <div className={styles.trackMeta}>
                <span>{track.duration}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default MusicTab;
