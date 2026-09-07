"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import MuxPlayer, { MaxResolution } from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { LandingVideo } from "@/lib/landing-video";
import { LANDING_VIDEO_FILES } from "@/lib/landing-video";
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
  const muxRef = useRef<MuxPlayerElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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

  const tryPlay = useCallback(() => {
    const media = muxId ? muxRef.current : videoRef.current;
    if (media?.paused) {
      media.play().catch(() => {});
    }
  }, [muxId]);

  useEffect(() => {
    tryPlay();
    const retryTimer = window.setInterval(tryPlay, 80);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 10000);
    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
    };
  }, [muxId, fileSrc, tryPlay]);

  const smoothLoop = useCallback((media: HTMLVideoElement | MuxPlayerElement) => {
    const { duration, currentTime } = media;
    if (!duration || !Number.isFinite(duration) || currentTime < 0.5) return;
    if (duration - currentTime <= 0.04) {
      media.currentTime = 0.001;
    }
  }, []);

  const handleTimeUpdate = useCallback(
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
      <div className={styles.media}>
        {muxId ? (
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
            initialBandwidthEstimateKbps={8000}
            maxResolution={MaxResolution.upTo2160p}
            nohotkeys
            proudlyDisplayMuxBadge={false}
            videoTitle="sweetiepie landing"
            className={`${styles.video} ${styles.muxPlayer}`}
            onLoadedMetadata={tryPlay}
            onCanPlay={tryPlay}
            onPlaying={tryPlay}
            onTimeUpdate={handleMuxTimeUpdate}
          />
        ) : (
          <video
            ref={videoRef}
            className={styles.video}
            src={fileSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            onLoadedMetadata={tryPlay}
            onCanPlay={tryPlay}
            onPlaying={tryPlay}
            onTimeUpdate={handleTimeUpdate}
          />
        )}
      </div>
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <h1 className={styles.title}>sweetiepie</h1>
        <span className={styles.hint}>Click to enter</span>
      </div>
    </button>
  );
}
