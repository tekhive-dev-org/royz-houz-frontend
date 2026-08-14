import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  ChevronsLeft,
  ChevronsRight,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import styles from "./TalentVideoPlayer.module.css";

/**
 * Format time in seconds to M:SS
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

/**
 * Production-ready, dynamically reusable VideoPlayerHero component.
 * Supports seeking, play/pause, volume adjustment, speed, quality, and CC toggling.
 */
export function VideoPlayerHero({
  video = {
    title: "The Sound Architect",
    thumbnail: "/assets/img/talents/producer-video-frame.jpg",
    duration: 214, // 3:34
  },
  initialTime = 8,
  autoPlay = false,
}) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(video.duration || 214);
  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);
  const [isCCActive, setIsCCActive] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [quality, setQuality] = useState("Auto");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const wrapperRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  // Keep duration and state in sync with video prop changes
  useEffect(() => {
    if (video.duration) {
      setDuration(video.duration);
    }
    setCurrentTime(0);
    setIsPlaying(true);
  }, [video.id, video.title, video.duration]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const speeds = ["0.75x", "1x", "1.25x", "1.5x", "2x"];
  const qualities = ["Auto", "1080p", "720p", "480p"];

  // Simulated playback timer for showcase mode
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      const speedMultiplier = parseFloat(playbackSpeed.replace("x", "")) || 1;
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return Math.min(prev + 1 * speedMultiplier, duration);
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, duration, playbackSpeed]);

  // Handle Seek Track click
  const handleSeek = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    setCurrentTime(percentage * duration);
  };

  // Skip 10 seconds backward
  const handleSkipBackward = () => {
    setCurrentTime((prev) => Math.max(0, prev - 10));
  };

  // Skip 10 seconds forward
  const handleSkipForward = () => {
    setCurrentTime((prev) => Math.min(duration, prev + 10));
  };

  // Handle Volume Slider click
  const handleVolumeClick = (e) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newVol = Math.max(0, Math.min(1, clickX / rect.width));
    setVolume(newVol);
    if (isMuted && newVol > 0) {
      setIsMuted(false);
    }
  };

  // Toggle Mute
  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev);
  };

  // Toggle Speed
  const handleSpeedToggle = () => {
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  // Toggle Quality
  const handleQualityToggle = () => {
    const nextIdx = (qualities.indexOf(quality) + 1) % qualities.length;
    setQuality(qualities[nextIdx]);
  };

  // Toggle Fullscreen
  const handleFullscreenToggle = () => {
    if (!wrapperRef.current) return;
    if (!document.fullscreenElement) {
      if (wrapperRef.current.requestFullscreen) {
        wrapperRef.current.requestFullscreen().catch(() => {});
      } else if (wrapperRef.current.webkitRequestFullscreen) {
        wrapperRef.current.webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const activeVolume = isMuted ? 0 : volume;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.videoWrapper} group`}
      aria-label={`Video player: ${video.title}`}
    >
      {/* Video Canvas Artwork */}
      <Image
        src={video.thumbnail || "/assets/img/talents/producer-video-frame.jpg"}
        alt={video.title}
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 66vw"
        className={styles.videoImage}
      />

      {/* Cinematic Dark Vignette & Gradient Overlay */}
      <div className={styles.videoGradientOverlay} />

      {/* Big Center Play/Pause Trigger Area */}
      <div
        className={styles.centerPlayTrigger}
        onClick={() => setIsPlaying(!isPlaying)}
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {!isPlaying && (
          <div className={styles.centerPlayBtn}>
            <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-white text-white translate-x-0.5" />
          </div>
        )}
      </div>

      {/* Floating Bottom Controls Container */}
      <div className={styles.controlsBar} onClick={(e) => e.stopPropagation()}>
        {/* Seek Progress Bar (Touch-friendly Hit Area) */}
        <div
          ref={progressRef}
          onClick={handleSeek}
          className={styles.progressContainer}
          role="progressbar"
          aria-valuenow={Math.round(progressPercent)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Seek track"
        >
          <div className={styles.progressTrack}>
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Bottom Controls Row */}
        <div className={styles.controlsRow}>
          {/* Left Control Group */}
          <div className={styles.controlsLeft}>
            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={styles.playPauseBtn}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-white text-white" />
              ) : (
                <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
              )}
            </button>

            {/* 10s Rewind */}
            <button
              type="button"
              onClick={handleSkipBackward}
              className={styles.controlIconBtn}
              aria-label="Rewind 10 seconds"
              title="Rewind 10s"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>

            {/* 10s Fast Forward */}
            <button
              type="button"
              onClick={handleSkipForward}
              className={styles.controlIconBtn}
              aria-label="Fast forward 10 seconds"
              title="Forward 10s"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>

            {/* Time Stamp Display */}
            <span className={styles.timeText}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Control Group */}
          <div className={styles.controlsRight}>
            {/* Speaker Mute/Unmute */}
            <button
              type="button"
              onClick={handleMuteToggle}
              className={styles.controlIconBtn}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || activeVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : activeVolume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Interactive Volume Slider (Desktop/Tablet) */}
            <div className={styles.volumeContainer}>
              <div
                ref={volumeRef}
                onClick={handleVolumeClick}
                className={styles.volumeTrack}
                role="slider"
                aria-valuenow={Math.round(activeVolume * 100)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Volume slider"
              >
                <div
                  className={styles.volumeFill}
                  style={{ width: `${activeVolume * 100}%` }}
                />
                <div
                  className={styles.volumeThumb}
                  style={{ left: `${activeVolume * 100}%` }}
                />
              </div>
            </div>

            {/* Closed Captions Badge */}
            <button
              type="button"
              onClick={() => setIsCCActive(!isCCActive)}
              className={isCCActive ? styles.ccBadgeActive : styles.pillBadge}
              aria-label="Closed captions"
              title="Closed Captions"
            >
              CC
            </button>

            {/* Playback Speed Badge */}
            <button
              type="button"
              onClick={handleSpeedToggle}
              className={styles.pillBadge}
              aria-label="Playback speed"
              title="Playback Speed"
            >
              {playbackSpeed}
            </button>

            {/* Quality Badge */}
            <button
              type="button"
              onClick={handleQualityToggle}
              className={`${styles.pillBadge} hidden xs:inline-flex`}
              aria-label="Video quality"
              title="Video Quality"
            >
              {quality}
            </button>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={handleFullscreenToggle}
              className={styles.controlIconBtn}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerHero;
