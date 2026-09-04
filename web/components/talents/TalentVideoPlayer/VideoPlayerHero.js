import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  ChevronsLeft,
  ChevronsRight,
  Maximize,
  Minimize,
  Music2,
  Loader2,
} from "lucide-react";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { PlayerVolumeControl } from "./PlayerVolumeControl";
import styles from "./TalentVideoPlayer.module.css";
import { getSafeMediaSource, parseMediaDurationToSeconds } from "./talentVideoUtils";

function formatTime(seconds) {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? Math.round(seconds) : 0;
  const hours = Math.floor(safeSeconds / 3600);
  const mins = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;
  if (hours > 0) {
    return `${hours}:${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function VideoPlayerHero({ media, autoPlay = false, onEnded, onDurationDetected, onPlaybackStart }) {
  const wrapperRef = useRef(null);
  const mediaRef = useRef(null);
  const progressRef = useRef(null);
  const lastAudibleVolumeRef = useRef(0.65);
  const lastDetectedDurationRef = useRef(null);
  const onDurationDetectedRef = useRef(onDurationDetected);
  const onPlaybackStartRef = useRef(onPlaybackStart);

  useEffect(() => {
    onDurationDetectedRef.current = onDurationDetected;
  }, [onDurationDetected]);

  useEffect(() => {
    onPlaybackStartRef.current = onPlaybackStart;
  }, [onPlaybackStart]);

  const source = getSafeMediaSource(media.videoUrl || media.trackUrl, media.mediaType);
  const isAudio = source?.type === "audio";
  const isNativeMedia = source?.type === "cloudinary" || isAudio;
  const isYouTubeVideo = source?.type === "youtube";
  const isIframeVideo = source?.type === "vimeo" || source?.type === "iframe";
  const mediaLabel = isAudio ? "audio" : "video";
  const initialDuration = parseMediaDurationToSeconds(media?.duration);
  const youtubePlayer = useYouTubePlayer({
    videoId: isYouTubeVideo ? source.videoId : null,
    autoPlay,
    fallbackDuration: initialDuration,
    onEnded,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAttemptedPlay, setHasAttemptedPlay] = useState(Boolean(autoPlay));
  const [isWaitingForData, setIsWaitingForData] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration);
  const hideControlsTimerRef = useRef(null);

  useEffect(() => {
    if (youtubePlayer.duration && youtubePlayer.duration > 0) {
      if (lastDetectedDurationRef.current !== youtubePlayer.duration) {
        lastDetectedDurationRef.current = youtubePlayer.duration;
        onDurationDetectedRef.current?.(youtubePlayer.duration);
      }
    }
  }, [youtubePlayer.duration]);

  const [volume, setVolume] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeIsPlaying = isYouTubeVideo ? youtubePlayer.isPlaying : isPlaying;
  const activeIsBuffering = isYouTubeVideo
    ? Boolean(youtubePlayer.isBuffering || (hasAttemptedPlay && !youtubePlayer.isPlaying && !youtubePlayer.isReady))
    : Boolean(isWaitingForData && (activeIsPlaying || hasAttemptedPlay));

  useEffect(() => {
    if (activeIsPlaying) {
      onPlaybackStartRef.current?.();
    }
  }, [activeIsPlaying]);

  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    setIsControlsVisible(true);
    if (activeIsPlaying && !activeIsBuffering) {
      hideControlsTimerRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 2500);
    }
  }, [activeIsPlaying, activeIsBuffering]);

  const handleUserActivity = useCallback(() => {
    scheduleHideControls();
  }, [scheduleHideControls]);

  const handleMouseLeave = useCallback(() => {
    if (activeIsPlaying && !activeIsBuffering) {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
      hideControlsTimerRef.current = setTimeout(() => {
        setIsControlsVisible(false);
      }, 400);
    }
  }, [activeIsPlaying, activeIsBuffering]);

  useEffect(() => {
    if (!activeIsPlaying || activeIsBuffering) {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
      setIsControlsVisible(true);
    } else {
      scheduleHideControls();
    }
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current);
      }
    };
  }, [activeIsPlaying, activeIsBuffering, scheduleHideControls]);

  // Reload the media element only when the media source URL changes or autoPlay changes
  useEffect(() => {
    const mediaElement = mediaRef.current;
    setCurrentTime(0);
    setIsPlaying(false);
    setIsWaitingForData(false);
    setHasAttemptedPlay(Boolean(autoPlay));
    setPlaybackSpeed(1);

    if (!mediaElement) return;
    mediaElement.pause();
    mediaElement.load();

    if (autoPlay) {
      setIsWaitingForData(true);
      mediaElement.play().catch(() => {
        setIsPlaying(false);
        setIsWaitingForData(false);
        setHasAttemptedPlay(false);
      });
    }
  }, [autoPlay, source?.url]);

  // Keep internal duration in sync if the media prop updates and hasn't been detected yet
  useEffect(() => {
    const fallbackNum = parseMediaDurationToSeconds(media?.duration);
    if (Number.isFinite(fallbackNum) && fallbackNum > 0) {
      setDuration((prev) => (prev > 0 ? prev : fallbackNum));
    }
  }, [media?.duration]);

  const lockLandscapeOrientation = async () => {
    try {
      if (typeof window !== "undefined" && window.screen?.orientation?.lock) {
        await window.screen.orientation.lock("landscape");
      }
    } catch {
      // Best-effort orientation lock; falls back to CSS landscape transform
    }
  };

  const unlockScreenOrientation = () => {
    try {
      if (typeof window !== "undefined" && window.screen?.orientation?.unlock) {
        window.screen.orientation.unlock();
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullscreen(active);
      if (!active) {
        unlockScreenOrientation();
      }
    };

    const mediaElement = mediaRef.current;
    const handleWebkitBegin = () => setIsFullscreen(true);
    const handleWebkitEnd = () => {
      setIsFullscreen(false);
      unlockScreenOrientation();
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    if (mediaElement) {
      mediaElement.addEventListener("webkitbeginfullscreen", handleWebkitBegin);
      mediaElement.addEventListener("webkitendfullscreen", handleWebkitEnd);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      if (mediaElement) {
        mediaElement.removeEventListener("webkitbeginfullscreen", handleWebkitBegin);
        mediaElement.removeEventListener("webkitendfullscreen", handleWebkitEnd);
      }
    };
  }, []);

  // Lock body scroll and handle Escape key when in pseudo-fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setIsFullscreen(false);
          unlockScreenOrientation();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
    document.body.style.overflow = "";
  }, [isFullscreen]);

  const handlePlayToggle = async () => {
    if (isYouTubeVideo) {
      setHasAttemptedPlay(true);
      youtubePlayer.togglePlay();
      return;
    }

    const mediaElement = mediaRef.current;
    if (!mediaElement) return;

    if (mediaElement.paused) {
      setHasAttemptedPlay(true);
      if (mediaElement.readyState < 3) {
        setIsWaitingForData(true);
      }
      try {
        await mediaElement.play();
      } catch {
        setIsPlaying(false);
        setIsWaitingForData(false);
        setHasAttemptedPlay(false);
      }
    } else {
      mediaElement.pause();
      setIsPlaying(false);
      setIsWaitingForData(false);
      setHasAttemptedPlay(false);
    }
  };

  const handleSeek = (event) => {
    if (!progressRef.current || !activeDuration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const percentage = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left) / rect.width)
    );
    const targetTime = percentage * activeDuration;
    if (isYouTubeVideo) {
      youtubePlayer.seekTo(targetTime);
      return;
    }
    if (mediaRef.current) {
      if (activeIsPlaying || hasAttemptedPlay) {
        setIsWaitingForData(true);
      }
      mediaRef.current.currentTime = targetTime;
    }
  };

  const handleSkip = (seconds) => {
    if (isYouTubeVideo) {
      youtubePlayer.seekTo(activeCurrentTime + seconds);
      return;
    }

    const mediaElement = mediaRef.current;
    if (!mediaElement) return;
    if (activeIsPlaying || hasAttemptedPlay) {
      setIsWaitingForData(true);
    }
    mediaElement.currentTime = Math.max(
      0,
      Math.min(mediaElement.duration || activeDuration, mediaElement.currentTime + seconds)
    );
  };

  const handleMuteToggle = () => {
    if (isYouTubeVideo) {
      youtubePlayer.toggleMute();
      return;
    }

    const mediaElement = mediaRef.current;
    if (!mediaElement) return;
    if (mediaElement.muted || mediaElement.volume === 0) {
      const restoredVolume = volume > 0 ? volume : lastAudibleVolumeRef.current;
      mediaElement.volume = restoredVolume;
      mediaElement.muted = false;
      setVolume(restoredVolume);
      setIsMuted(false);
    } else {
      mediaElement.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (nextValue) => {
    const nextVolume = Math.max(0, Math.min(1, nextValue));
    if (isYouTubeVideo) {
      youtubePlayer.setVolume(nextVolume);
      return;
    }

    const mediaElement = mediaRef.current;
    if (!mediaElement) return;
    mediaElement.volume = nextVolume;
    mediaElement.muted = nextVolume === 0;
    if (nextVolume > 0) lastAudibleVolumeRef.current = nextVolume;
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
  };

  const handleSpeedToggle = () => {
    if (isYouTubeVideo) {
      youtubePlayer.cyclePlaybackSpeed();
      return;
    }

    const mediaElement = mediaRef.current;
    if (!mediaElement) return;
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
    mediaElement.playbackRate = nextSpeed;
    setPlaybackSpeed(nextSpeed);
  };

  const handleFullscreenToggle = async () => {
    const wrapper = wrapperRef.current;
    const mediaElement = mediaRef.current;
    if (!wrapper) return;

    const isCurrentlyFullscreen = Boolean(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      isFullscreen
    );

    if (isCurrentlyFullscreen) {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          }
        } catch {}
      }
      setIsFullscreen(false);
      unlockScreenOrientation();
      return;
    }

    // Entering fullscreen
    let nativeWorked = false;
    try {
      if (wrapper.requestFullscreen) {
        await wrapper.requestFullscreen();
        nativeWorked = true;
      } else if (wrapper.webkitRequestFullscreen) {
        await wrapper.webkitRequestFullscreen();
        nativeWorked = true;
      }
    } catch {
      nativeWorked = false;
    }

    // On iOS Safari where div.requestFullscreen is not allowed, fallback to native video fullscreen
    if (!nativeWorked && !isYouTubeVideo && mediaElement?.webkitEnterFullscreen) {
      try {
        mediaElement.webkitEnterFullscreen();
        return;
      } catch {}
    }

    setIsFullscreen(true);
    await lockLandscapeOrientation();
  };

  const activeCurrentTime = isYouTubeVideo ? youtubePlayer.currentTime : currentTime;
  const activeDuration = isYouTubeVideo ? youtubePlayer.duration : duration;
  const activePlaybackSpeed = isYouTubeVideo ? youtubePlayer.playbackSpeed : playbackSpeed;
  const activeVolumeLevel = isYouTubeVideo ? youtubePlayer.volume : volume;
  const activeMuted = isYouTubeVideo ? youtubePlayer.isMuted : isMuted;
  const progressPercent = activeDuration > 0 ? (activeCurrentTime / activeDuration) * 100 : 0;

  const controlsFadeClass =
    isControlsVisible || !activeIsPlaying || activeIsBuffering
      ? styles.controlsVisible
      : styles.controlsHidden;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.videoWrapper} ${isFullscreen ? styles.fullscreenLandscape : ""} ${
        !isControlsVisible && activeIsPlaying && !activeIsBuffering ? styles.cursorHidden : ""
      }`}
      onPointerMove={handleUserActivity}
      onPointerDown={handleUserActivity}
      onPointerEnter={handleUserActivity}
      onPointerLeave={handleMouseLeave}
      aria-label={`${isAudio ? "Audio" : "Video"} player: ${media.title}`}
    >
      {isYouTubeVideo ? (
        <div
          ref={youtubePlayer.mountRef}
          className={styles.youtubePlayerMount}
          aria-label={`YouTube video: ${media.title}`}
        />
      ) : null}

      {isIframeVideo ? (
        <iframe
          src={source.url}
          title={media.title || "Royz House Media Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className={styles.videoMedia}
        />
      ) : null}

      {isNativeMedia ? (
        <video
          ref={mediaRef}
          className={`${styles.videoMedia} ${isAudio ? styles.audioMediaElement : ""}`}
          poster={!isAudio ? media.thumbnail || undefined : undefined}
          preload="auto"
          playsInline
          muted={isMuted}
          onWaiting={() => {
            if (activeIsPlaying || hasAttemptedPlay) {
              setIsWaitingForData(true);
            }
          }}
          onStalled={() => {
            if (activeIsPlaying || hasAttemptedPlay) {
              setIsWaitingForData(true);
            }
          }}
          onSeeking={() => {
            if (activeIsPlaying || hasAttemptedPlay) {
              setIsWaitingForData(true);
            }
          }}
          onCanPlay={() => setIsWaitingForData(false)}
          onCanPlayThrough={() => setIsWaitingForData(false)}
          onPlaying={() => {
            setIsPlaying(true);
            setIsWaitingForData(false);
            setHasAttemptedPlay(true);
          }}
          onPause={() => {
            setIsPlaying(false);
            setIsWaitingForData(false);
          }}
          onSeeked={() => setIsWaitingForData(false)}
          onError={() => {
            setIsPlaying(false);
            setIsWaitingForData(false);
            setHasAttemptedPlay(false);
          }}
          onEnded={() => {
            setIsPlaying(false);
            setIsWaitingForData(false);
            setHasAttemptedPlay(false);
            onEnded?.();
          }}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => {
            setIsWaitingForData(false);
            const mediaDuration = event.currentTarget.duration;
            if (Number.isFinite(mediaDuration) && mediaDuration > 0) {
              setDuration(mediaDuration);
              if (lastDetectedDurationRef.current !== mediaDuration) {
                lastDetectedDurationRef.current = mediaDuration;
                onDurationDetectedRef.current?.(mediaDuration);
              }
            }
            event.currentTarget.volume = volume;
            event.currentTarget.muted = isMuted;
          }}
        >
          <source src={source.url} type={isAudio ? "audio/mpeg" : "video/mp4"} />
        </video>
      ) : null}

      {/* Rotating spinning buffering/loading indicator */}
      {activeIsBuffering ? (
        <div className={styles.spinnerContainer} aria-label="Loading media" role="status">
          <div className={styles.spinnerBackdrop}>
            <div className={`${styles.spinnerRotator} royz-spin`}>
              <Loader2 className={styles.spinnerIcon} />
            </div>
          </div>
        </div>
      ) : null}

      {isAudio ? (
        <div className={styles.audioBackdrop}>
          {media.thumbnail ? (
            <Image
              src={media.thumbnail}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 66vw"
              className={styles.audioArtwork}
            />
          ) : null}
          <div className={styles.audioIdentity}>
            <span className={styles.audioIcon} aria-hidden="true">
              <Music2 />
            </span>
            <span className={styles.audioType}>Now playing</span>
            <strong className={styles.audioTitle}>{media.title}</strong>
          </div>
        </div>
      ) : null}

      {!source && media.thumbnail ? (
        <Image
          src={media.thumbnail}
          alt={media.title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className={styles.videoImage}
        />
      ) : null}

      {!source ? (
        <div className={styles.mediaUnavailable}>Media unavailable</div>
      ) : null}

      {isNativeMedia || isYouTubeVideo ? (
        <>
          <div className={`${styles.videoGradientOverlay} ${controlsFadeClass}`} />
          <button
            type="button"
            className={`${styles.centerPlayTrigger} ${controlsFadeClass}`}
            onClick={handlePlayToggle}
            aria-label={activeIsPlaying ? `Pause ${mediaLabel}` : `Play ${mediaLabel}`}
          >
            {!activeIsPlaying && !activeIsBuffering ? (
              <span className={styles.centerPlayBtn}>
                <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-white text-white translate-x-0.5" />
              </span>
            ) : null}
          </button>

          <div className={`${styles.controlsBar} ${controlsFadeClass}`}>
            <div
              ref={progressRef}
              onClick={handleSeek}
              className={styles.progressContainer}
              role="slider"
              tabIndex={0}
              aria-valuenow={Math.round(activeCurrentTime)}
              aria-valuemin={0}
              aria-valuemax={Math.round(activeDuration)}
              aria-label={`${isAudio ? "Audio" : "Video"} progress`}
            >
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className={styles.controlsRow}>
              <div className={styles.controlsLeft}>
                <button
                  type="button"
                  onClick={handlePlayToggle}
                  className={styles.playPauseBtn}
                  aria-label={activeIsPlaying ? "Pause" : "Play"}
                >
                  {activeIsPlaying ? (
                    <Pause className="w-4 h-4 fill-white text-white" />
                  ) : (
                    <Play className="w-4 h-4 fill-white text-white translate-x-0.5" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSkip(-10)}
                  className={styles.controlIconBtn}
                  aria-label="Rewind 10 seconds"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSkip(10)}
                  className={styles.controlIconBtn}
                  aria-label="Fast forward 10 seconds"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
                <span className={styles.timeText}>
                  {formatTime(activeCurrentTime)} / {formatTime(activeDuration)}
                </span>
              </div>

              <div className={styles.controlsRight}>
                <PlayerVolumeControl
                  volume={activeVolumeLevel}
                  isMuted={activeMuted}
                  onVolumeChange={handleVolumeChange}
                  onMuteToggle={handleMuteToggle}
                  disabled={isYouTubeVideo && !youtubePlayer.isReady}
                />
                <button
                  type="button"
                  onClick={handleSpeedToggle}
                  className={styles.pillBadge}
                  aria-label="Playback speed"
                >
                  {activePlaybackSpeed}x
                </button>
                <button
                  type="button"
                  onClick={handleFullscreenToggle}
                  className={styles.controlIconBtn}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
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
        </>
      ) : null}
    </div>
  );
}

export default VideoPlayerHero;
