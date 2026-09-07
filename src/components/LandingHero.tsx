"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import MuxPlayer, {
  MaxResolution,
  MinResolution,
  RenditionOrder,
} from "@mux/mux-player-react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const muxRef = useRef<MuxPlayerElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);
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

  useEffect(() => {
    setVideoReady(false);
  }, [useMux, muxId, fileSrc]);

  useEffect(() => {
    if (useMux) {
      muxRef.current?.play().catch(() => {});
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [useMux, muxId, fileSrc]);

  const markVideoReady = useCallback(() => {
    setVideoReady(true);
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
          minResolution={MinResolution.noLessThan1080p}
          maxResolution={MaxResolution.upTo2160p}
          renditionOrder={RenditionOrder.DESCENDING}
          nohotkeys
          proudlyDisplayMuxBadge={false}
          videoTitle="sweetiepie landing"
          className={`${videoClassName} ${styles.muxPlayer}`}
          onPlaying={markVideoReady}
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
          onPlaying={markVideoReady}
          onTimeUpdate={handleVideoTimeUpdate}
        />
      )}
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <h1 className={styles.title}>sweetiepie</h1>
        <span className={styles.hint}>Tap or click to enter</span>
      </div>
    </button>
  );
}
