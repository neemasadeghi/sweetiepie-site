"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { LandingVideo } from "@/lib/landing-video";
import {
  LANDING_VIDEO_FILES,
  getLandingMp4Url,
  getLandingPosterUrl,
} from "@/lib/landing-video";
import styles from "./LandingHero.module.css";

const PORTRAIT_MQ = "(orientation: portrait)";

function subscribeOrientation(cb: () => void) {
  const mq = window.matchMedia(PORTRAIT_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getPortraitSnapshot() {
  return window.matchMedia(PORTRAIT_MQ).matches;
}

type LandingHeroProps = {
  landing: LandingVideo;
  revealed: boolean;
  onReveal: () => void;
};

export function LandingHero({ landing, revealed, onReveal }: LandingHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPortrait = useSyncExternalStore(
    subscribeOrientation,
    getPortraitSnapshot,
    () => false
  );

  const muxId = (
    isPortrait ? landing.portraitPlaybackId : landing.landscapePlaybackId
  ).trim();
  const fileSrc = isPortrait
    ? LANDING_VIDEO_FILES.portrait
    : LANDING_VIDEO_FILES.landscape;
  const videoSrc = muxId ? getLandingMp4Url(muxId) : fileSrc;
  const posterUrl = muxId ? getLandingPosterUrl(muxId, { portrait: isPortrait }) : "";

  useEffect(() => {
    setIsPlaying(false);
  }, [videoSrc]);

  const tryPlay = useCallback(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    if (video.paused) {
      video.play().catch(() => {});
    }
  }, [videoSrc]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    video.load();
    tryPlay();
  }, [videoSrc, tryPlay]);

  useEffect(() => {
    tryPlay();
    const retryTimer = window.setInterval(tryPlay, 100);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 10000);
    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
    };
  }, [videoSrc, tryPlay]);

  const handlePlaying = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const handleCanPlay = useCallback(() => {
    tryPlay();
  }, [tryPlay]);

  const smoothLoop = useCallback((media: HTMLVideoElement) => {
    const { duration, currentTime } = media;
    if (!duration || !Number.isFinite(duration)) return;
    if (duration - currentTime <= 0.04) {
      media.currentTime = 0.001;
    }
  }, []);

  const handleVideoTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      smoothLoop(event.currentTarget);
    },
    [smoothLoop]
  );

  const videoClassName = `${styles.video} ${isPlaying ? styles.videoReady : ""}`;

  return (
    <button
      type="button"
      className={`${styles.hero} ${revealed ? styles.heroDismissed : ""}`}
      onClick={revealed ? undefined : onReveal}
      aria-label={revealed ? undefined : "Enter sweetiepie"}
      tabIndex={revealed ? -1 : 0}
      disabled={revealed}
    >
      <div className={styles.fallback} aria-hidden />
      {posterUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={posterUrl}
          alt=""
          className={`${styles.poster} ${isPlaying ? styles.posterHidden : ""}`}
          aria-hidden
          fetchPriority="high"
          decoding="async"
        />
      ) : null}
      <video
        ref={videoRef}
        key={videoSrc}
        className={videoClassName}
        src={videoSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        tabIndex={-1}
        // @ts-expect-error fetchPriority is valid on video
        fetchPriority="high"
        onLoadedMetadata={tryPlay}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onTimeUpdate={handleVideoTimeUpdate}
      />
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <h1 className={styles.title}>sweetiepie</h1>
        <span className={styles.hint}>Click to enter</span>
      </div>
    </button>
  );
}
