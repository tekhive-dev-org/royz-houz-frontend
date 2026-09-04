import { Volume1, Volume2, VolumeX } from "lucide-react";
import styles from "./TalentVideoPlayer.module.css";

export function PlayerVolumeControl({ volume, isMuted, onVolumeChange, onMuteToggle, disabled = false }) {
  const normalizedVolume = Math.max(0, Math.min(1, Number(volume) || 0));
  const audibleVolume = isMuted ? 0 : normalizedVolume;
  const percentage = Math.round(audibleVolume * 100);

  return (
    <div className={styles.volumeControl}>
      <button
        type="button"
        onClick={onMuteToggle}
        className={styles.controlIconBtn}
        aria-label={isMuted || percentage === 0 ? "Unmute" : "Mute"}
        disabled={disabled}
      >
        {isMuted || percentage === 0 ? (
          <VolumeX className="w-4 h-4 text-red-400" />
        ) : percentage < 50 ? (
          <Volume1 className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      <div className={styles.volumeSlider}>
        <progress
          className={styles.volumeProgress}
          max="100"
          value={percentage}
          aria-hidden="true"
        />
        <input
          className={styles.volumeRange}
          type="range"
          min="0"
          max="100"
          step="1"
          value={percentage}
          onChange={(event) => onVolumeChange(Number(event.target.value) / 100)}
          aria-label="Volume"
          aria-valuetext={`${percentage}%`}
          disabled={disabled}
        />
      </div>

      <output className={styles.volumeValue} aria-live="off">
        {percentage}%
      </output>
    </div>
  );
}

export default PlayerVolumeControl;
