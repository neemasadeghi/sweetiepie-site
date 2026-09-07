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
  const [videoReady, setVideoReady] = useState(false);
  const isPortrait = useSyncExternalStore(
    subscribeOrientation,
    getPortraitSnapshot,
    () => false
  );

  const muxId = (
    isPortrait ? landing.portraitPlaybackId : landing.landscapePlaybackId
  ).trim();
  const muxMp4 = muxId ? getLandingMp4Url(muxId) : "";
  const fileSrc = isPortrait
    ? LANDING_VIDEO_FILES.portrait
    : LANDING_VIDEO_FILES.landscape;
  const videoSrc = muxMp4 || fileSrc;
  const posterUrl = muxId ? getLandingPosterUrl(muxId, { portrait: isPortrait }) : "";

  useEffect(() => {
    setVideoReady(false);
  }, [videoSrc]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;
    video.load();
    video.play().catch(() => {});
  }, [videoSrc]);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
  }, []);

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

  const videoClassName = `${styles.video} ${videoReady ? styles.videoReady : ""}`;

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
          className={`${styles.poster} ${videoReady ? styles.posterHidden : ""}`}
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
        onLoadedData={markVideoReady}
        onCanPlay={markVideoReady}
        onPlaying={markVideoReady}
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
