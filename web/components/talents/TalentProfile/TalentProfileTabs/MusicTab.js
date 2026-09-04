import { useRouter } from "next/router";
import { Play } from "lucide-react";
import {
  getSafeAudioSource,
  getTalentMediaPath,
} from "@/components/talents/TalentVideoPlayer/talentVideoUtils";
import styles from "./TalentProfileTabs.module.css";

export function MusicTab({ talent }) {
  const router = useRouter();
  const tracks = Array.isArray(talent?.musicTracks) ? talent.musicTracks : [];

  const handleTrackClick = (track) => {
    const mediaPath = getTalentMediaPath(talent, track);
    if (!getSafeAudioSource(track.trackUrl) || !mediaPath) return;
    void router.push(mediaPath);
  };

  return (
    <div
      className={styles.trackContainer}
      role="tabpanel"
      aria-label="Music Tracks"
    >
      <div className={styles.trackList}>
        {tracks.map((track, idx) => {
          const trackId = String(track.id || `track-${idx}`);
          const hasTrackUrl = Boolean(getSafeAudioSource(track.trackUrl));

          return (
            <button
              key={trackId}
              type="button"
              onClick={() => handleTrackClick(track)}
              className={styles.trackCard}
              disabled={!hasTrackUrl}
              aria-label={
                hasTrackUrl
                  ? `Open ${track.title} in the media player`
                  : `${track.title} audio unavailable`
              }
            >
              <span className={styles.trackInfo}>
                <span className={styles.trackPlayBtn} aria-hidden="true">
                  <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                </span>

                <span className={styles.trackDetails}>
                  <span className="flex items-center">
                    <span className={styles.trackTitle}>{track.title}</span>
                  </span>

                  {track.plays || track.streams ? (
                    <span className={styles.trackPlays}>
                      {track.plays || `${track.streams} Plays`}
                    </span>
                  ) : null}
                </span>
              </span>

              <span className={styles.trackMeta}>
                <span>{track.duration}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default MusicTab;
