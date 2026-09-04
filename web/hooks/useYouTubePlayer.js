import { useCallback, useEffect, useRef, useState } from "react";

let youtubeApiPromise;

function loadYouTubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("YouTube playback requires a browser."));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      existingCallback?.();
      if (window.YT?.Player) resolve(window.YT);
      else reject(new Error("The YouTube player API did not initialize."));
    };

    const existingScript = document.getElementById("youtube-iframe-api");
    if (existingScript) return;

    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => reject(new Error("The YouTube player API could not be loaded."));
    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

export function useYouTubePlayer({ videoId, autoPlay = false, fallbackDuration = 0, onEnded }) {
  const mountRef = useRef(null);
  const playerRef = useRef(null);
  const timerRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  const audioVolumeRef = useRef(0.65);
  const lastAudibleVolumeRef = useRef(0.65);
  const mutedRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(Number(fallbackDuration) || 0);
  const [volume, setVolumeState] = useState(0.65);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    setDuration(Number(fallbackDuration) || 0);
  }, [fallbackDuration]);

  useEffect(() => {
    if (!videoId || !mountRef.current) return undefined;

    let isActive = true;
    setIsReady(false);
    setIsPlaying(false);
    setCurrentTime(0);

    const mountElement = mountRef.current;
    const playerTarget = document.createElement("div");
    mountElement.replaceChildren(playerTarget);

    loadYouTubeApi()
      .then((YT) => {
        if (!isActive || !mountElement.isConnected) return;
        playerRef.current = new YT.Player(playerTarget, {
          videoId,
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: autoPlay ? 1 : 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (!isActive) return;
              event.target.setVolume(audioVolumeRef.current * 100);
              if (mutedRef.current) event.target.mute();
              else event.target.unMute();
              setVolumeState(audioVolumeRef.current);
              setIsMuted(mutedRef.current);
              const playerDuration = event.target.getDuration();
              if (Number.isFinite(playerDuration) && playerDuration > 0) setDuration(playerDuration);
              setIsReady(true);
              if (autoPlay) event.target.playVideo();
            },
            onStateChange: (event) => {
              if (!isActive) return;
              const playing = event.data === YT.PlayerState.PLAYING;
              const buffering = event.data === YT.PlayerState.BUFFERING;
              setIsPlaying(playing);
              setIsBuffering(buffering);
              if (event.data === YT.PlayerState.ENDED) {
                setCurrentTime(event.target.getDuration() || 0);
                onEndedRef.current?.();
              }
            },
          },
        });
      })
      .catch(() => {
        if (isActive) setIsReady(false);
      });

    return () => {
      isActive = false;
      window.clearInterval(timerRef.current);
      timerRef.current = null;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      mountElement.replaceChildren();
    };
  }, [autoPlay, videoId]);

  useEffect(() => {
    window.clearInterval(timerRef.current);
    if (!isPlaying) return undefined;

    timerRef.current = window.setInterval(() => {
      const player = playerRef.current;
      const nextTime = player?.getCurrentTime?.();
      const nextDuration = player?.getDuration?.();
      if (Number.isFinite(nextTime)) setCurrentTime(nextTime);
      if (Number.isFinite(nextDuration) && nextDuration > 0) setDuration(nextDuration);
    }, 250);

    return () => {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    if (player.getPlayerState() === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      if (!mutedRef.current) {
        player.unMute();
        setIsMuted(false);
      }
      if (player.getVolume() === 0) player.setVolume(audioVolumeRef.current * 100);
      player.playVideo();
    }
  }, [isReady]);

  const seekTo = useCallback((seconds) => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    const playerDuration = player.getDuration() || 0;
    const target = Math.max(0, Math.min(playerDuration, seconds));
    player.seekTo(target, true);
    setCurrentTime(target);
  }, [isReady]);

  const setVolume = useCallback((nextVolume) => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    const normalizedVolume = Math.max(0, Math.min(1, nextVolume));
    player.setVolume(normalizedVolume * 100);
    audioVolumeRef.current = normalizedVolume;
    setVolumeState(normalizedVolume);

    if (normalizedVolume === 0) {
      player.mute();
      mutedRef.current = true;
      setIsMuted(true);
    } else {
      player.unMute();
      lastAudibleVolumeRef.current = normalizedVolume;
      mutedRef.current = false;
      setIsMuted(false);
    }
  }, [isReady]);

  const toggleMute = useCallback(() => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    if (player.isMuted() || audioVolumeRef.current === 0) {
      const restoredVolume = audioVolumeRef.current > 0
        ? audioVolumeRef.current
        : lastAudibleVolumeRef.current;
      player.setVolume(restoredVolume * 100);
      player.unMute();
      audioVolumeRef.current = restoredVolume;
      mutedRef.current = false;
      setVolumeState(restoredVolume);
      setIsMuted(false);
    } else {
      player.mute();
      mutedRef.current = true;
      setIsMuted(true);
    }
  }, [isReady]);

  const cyclePlaybackSpeed = useCallback(() => {
    const player = playerRef.current;
    if (!player || !isReady) return;
    const supportedRates = player.getAvailablePlaybackRates?.() || [1];
    const preferredRates = [0.75, 1, 1.25, 1.5, 2].filter((rate) => supportedRates.includes(rate));
    const rates = preferredRates.length ? preferredRates : [1];
    const currentIndex = rates.indexOf(playbackSpeed);
    const nextSpeed = rates[(currentIndex + 1) % rates.length];
    player.setPlaybackRate(nextSpeed);
    setPlaybackSpeed(nextSpeed);
  }, [isReady, playbackSpeed]);

  return {
    mountRef,
    isReady,
    isPlaying,
    isBuffering,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackSpeed,
    togglePlay,
    seekTo,
    setVolume,
    toggleMute,
    cyclePlaybackSpeed,
  };
}
