"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import MuxPlayer, { MaxResolution } from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { LandingVideo } from "@/lib/landing-video";
import {
  LANDING_VIDEO_FILES,
  getLandingMp4Url,
  getLandingPosterUrl,
} from "@/lib/landing-video";
import styles from "./LandingHero.module.css";

const PORTRAIT_MQ = "(orientation: portrait)";
const MOTION_THRESHOLD_SEC = 0.08;

function subscribeOrientation(cb: () => void) {
  const mq = window.matchMedia(PORTRAIT_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getPortraitSnapshot() {
  return window.matchMedia(PORTRAIT_MQ).matches;
}

type PlaybackMode = "mp4" | "hls";

type LandingHeroProps = {
  landing: LandingVideo;
  revealed: boolean;
  onReveal: () => void;
};

export function LandingHero({ landing, revealed, onReveal }: LandingHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const muxRef = useRef<MuxPlayerElement | null>(null);
  const [showPoster, setShowPoster] = useState(true);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>("mp4");
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
  const mp4Src = muxId ? getLandingMp4Url(muxId) : "";
  const useMux = Boolean(muxId);
  const posterUrl = useMux ? getLandingPosterUrl(muxId, { portrait: isPortrait }) : "";

  useEffect(() => {
    setShowPoster(true);
    setPlaybackMode("mp4");
  }, [muxId, fileSrc, isPortrait]);

  const markMotion = useCallback((media: HTMLVideoElement | MuxPlayerElement) => {
    if (!media.paused && media.currentTime > MOTION_THRESHOLD_SEC) {
      setShowPoster(false);
    }
  }, []);

  const tryPlayNative = useCallback(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const tryPlayMux = useCallback(() => {
    muxRef.current?.play().catch(() => {});
  }, []);

  const tryPlay = useCallback(() => {
    if (useMux && playbackMode === "hls") {
      tryPlayMux();
      return;
    }
    tryPlayNative();
  }, [useMux, playbackMode, tryPlayMux, tryPlayNative]);

  useEffect(() => {
    tryPlay();
    const retryTimer = window.setInterval(tryPlay, 120);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 12000);
    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
    };
  }, [muxId, fileSrc, playbackMode, tryPlay]);

  const switchToHls = useCallback(() => {
    setPlaybackMode("hls");
    setShowPoster(true);
  }, []);

  const handleNativeError = useCallback(() => {
    if (useMux) switchToHls();
  }, [useMux, switchToHls]);

  const smoothLoop = useCallback((media: HTMLVideoElement | MuxPlayerElement) => {
    const { duration, currentTime } = media;
    if (!duration || !Number.isFinite(duration) || currentTime < 0.5) return;
    if (duration - currentTime <= 0.04) {
      media.currentTime = 0.001;
    }
  }, []);

  const handleNativeTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      const media = event.currentTarget;
      markMotion(media);
      smoothLoop(media);
    },
    [markMotion, smoothLoop]
  );

  const handleMuxTimeUpdate = useCallback(
    (event: CustomEvent<{ composed: true; detail: unknown }>) => {
      const media = event.target as MuxPlayerElement | null;
      if (!media) return;
      markMotion(media);
      smoothLoop(media);
    },
    [markMotion, smoothLoop]
  );

  const showNativeVideo = !useMux || playbackMode === "mp4";
  const nativeSrc = mp4Src || fileSrc;

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
        {showNativeVideo ? (
          <video
            ref={videoRef}
            className={styles.video}
            src={nativeSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            crossOrigin={mp4Src ? "anonymous" : undefined}
            tabIndex={-1}
            onCanPlay={tryPlayNative}
            onPlaying={() => tryPlayNative()}
            onError={handleNativeError}
            onTimeUpdate={handleNativeTimeUpdate}
          />
        ) : (
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
            className={`${styles.video} ${styles.muxPlayer}`}
            onCanPlay={tryPlayMux}
            onPlaying={() => tryPlayMux()}
            onTimeUpdate={handleMuxTimeUpdate}
          />
        )}
        {posterUrl && showPoster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt=""
            className={styles.poster}
            aria-hidden
            fetchPriority="high"
            decoding="async"
          />
        ) : null}
      </div>
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <h1 className={styles.title}>sweetiepie</h1>
        <span className={styles.hint}>Click to enter</span>
      </div>
    </button>
  );
}
