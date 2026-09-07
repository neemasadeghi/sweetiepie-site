"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import MuxPlayer, { MaxResolution } from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { LandingVideo } from "@/lib/landing-video";
import { LANDING_VIDEO_FILES, getLandingPosterUrl } from "@/lib/landing-video";
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
  const muxRef = useRef<MuxPlayerElement | null>(null);
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
  const useMux = Boolean(muxId);
  const posterUrl = useMux ? getLandingPosterUrl(muxId, { portrait: isPortrait }) : "";

  useEffect(() => {
    setIsPlaying(false);
  }, [useMux, muxId, fileSrc]);

  const tryPlay = useCallback(() => {
    if (useMux) {
      muxRef.current?.play().catch(() => {});
      return;
    }
    videoRef.current?.play().catch(() => {});
  }, [useMux]);

  useLayoutEffect(() => {
    tryPlay();
  }, [useMux, muxId, fileSrc, tryPlay]);

  useEffect(() => {
    tryPlay();
    const retryTimer = window.setInterval(tryPlay, 150);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 8000);
    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
    };
  }, [useMux, muxId, fileSrc, tryPlay]);

  const handleCanPlay = useCallback(() => {
    tryPlay();
  }, [tryPlay]);

  const handlePlaying = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const smoothLoop = useCallback((media: MuxPlayerElement | HTMLVideoElement) => {
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

  const handleMuxTimeUpdate = useCallback(
    (event: CustomEvent<{ composed: true; detail: unknown }>) => {
      const media = event.target as MuxPlayerElement | null;
      if (media) smoothLoop(media);
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
      {useMux ? (
        <MuxPlayer
          ref={muxRef}
          playbackId={muxId}
          streamType="on-demand"
          muted
          loop
          autoPlay
          playsInline
          preload="auto"
          poster=""
          placeholder=""
          startTime={0.001}
          minPreloadSegments={1}
          initialBandwidthEstimateKbps={12000}
          maxResolution={MaxResolution.upTo2160p}
          nohotkeys
          proudlyDisplayMuxBadge={false}
          videoTitle="sweetiepie landing"
          className={`${videoClassName} ${styles.muxPlayer}`}
          onCanPlay={handleCanPlay}
          onPlaying={handlePlaying}
          onTimeUpdate={handleMuxTimeUpdate}
        />
      ) : (
        <video
          ref={videoRef}
          className={videoClassName}
          src={fileSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          onCanPlay={handleCanPlay}
          onPlaying={handlePlaying}
          onTimeUpdate={handleVideoTimeUpdate}
        />
      )}
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <h1 className={styles.title}>sweetiepie</h1>
        <span className={styles.hint}>Click to enter</span>
      </div>
    </button>
  );
}
