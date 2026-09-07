"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
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
    if (useMux) {
      muxRef.current?.play().catch(() => {});
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    video.load();
    video.play().catch(() => {});
  }, [useMux, muxId, fileSrc]);

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
          minResolution={MinResolution.noLessThan1080p}
          maxResolution={MaxResolution.upTo2160p}
          renditionOrder={RenditionOrder.DESCENDING}
          nohotkeys
          proudlyDisplayMuxBadge={false}
          videoTitle="sweetiepie landing"
          className={`${styles.video} ${styles.muxPlayer}`}
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
