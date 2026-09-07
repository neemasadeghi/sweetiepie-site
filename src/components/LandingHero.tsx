"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import MuxPlayer, { MaxResolution } from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { LandingVideo } from "@/lib/landing-video";
import { LANDING_VIDEO_FILES, getLandingPosterUrl } from "@/lib/landing-video";
import styles from "./LandingHero.module.css";

const PORTRAIT_MQ = "(orientation: portrait)";
const MOBILE_MQ = "(max-width: 768px)";

function subscribePortraitLayout(cb: () => void) {
  const portraitMq = window.matchMedia(PORTRAIT_MQ);
  const mobileMq = window.matchMedia(MOBILE_MQ);
  const handler = () => cb();
  portraitMq.addEventListener("change", handler);
  mobileMq.addEventListener("change", handler);
  return () => {
    portraitMq.removeEventListener("change", handler);
    mobileMq.removeEventListener("change", handler);
  };
}

function getPortraitLayoutSnapshot() {
  return (
    window.matchMedia(PORTRAIT_MQ).matches ||
    window.matchMedia(MOBILE_MQ).matches
  );
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
  const isPortraitLayout = useSyncExternalStore(
    subscribePortraitLayout,
    getPortraitLayoutSnapshot,
    () => false
  );

  const landscapeId = landing.landscapePlaybackId.trim();
  const portraitId = landing.portraitPlaybackId.trim();
  const muxId = (
    isPortraitLayout && portraitId ? portraitId : landscapeId
  ).trim();
  const fileSrc = isPortraitLayout
    ? LANDING_VIDEO_FILES.portrait
    : LANDING_VIDEO_FILES.landscape;
  const useMux = Boolean(muxId);
  const posterUrl = useMux
    ? getLandingPosterUrl(muxId, { portrait: isPortraitLayout && Boolean(portraitId) })
    : "";

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
      <div className={styles.mediaFill} aria-hidden>
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt=""
            className={`${styles.poster} ${videoReady ? styles.posterHidden : ""}`}
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
            maxResolution={MaxResolution.upTo2160p}
            nohotkeys
            proudlyDisplayMuxBadge={false}
            videoTitle="sweetiepie landing"
            className={`${videoClassName} ${styles.muxPlayer}`}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              "--media-object-fit": "cover",
              "--media-object-position": "center",
            }}
            onLoadedData={markVideoReady}
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
            onLoadedData={markVideoReady}
            onPlaying={markVideoReady}
            onTimeUpdate={handleVideoTimeUpdate}
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
