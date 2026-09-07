"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import MuxPlayer, { MaxResolution, MinResolution } from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { LandingVideo } from "@/lib/landing-video";
import {
  getLandingPosterUrl,
  LANDING_VIDEO_FILES,
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
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const [showPoster, setShowPoster] = useState(true);
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
  const posterUrl = muxId
    ? getLandingPosterUrl(muxId, {
        portrait: isPortrait,
        width: isPortrait ? 1920 : 2560,
        height: isPortrait ? 2560 : 1440,
      })
    : "";

  useEffect(() => {
    setShowPoster(true);
  }, [muxId, fileSrc, isPortrait]);

  const tryPlay = useCallback((media: HTMLVideoElement | MuxPlayerElement) => {
    if (media.paused) {
      media.play().catch(() => {});
    }
  }, []);

  const hidePosterWhenPlaying = useCallback(
    (media: HTMLVideoElement | MuxPlayerElement) => {
      if (
        showPoster &&
        !media.paused &&
        media.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA &&
        media.currentTime > 0.05
      ) {
        setShowPoster(false);
      }
    },
    [showPoster]
  );

  const handleMuxTimeUpdate = useCallback(
    (event: CustomEvent<{ composed: true; detail: unknown }>) => {
      const media = event.target as MuxPlayerElement | null;
      if (media) hidePosterWhenPlaying(media);
    },
    [hidePosterWhenPlaying]
  );

  const handleNativeTimeUpdate = useCallback(
    (event: React.SyntheticEvent<HTMLVideoElement>) => {
      hidePosterWhenPlaying(event.currentTarget);
    },
    [hidePosterWhenPlaying]
  );

  useEffect(() => {
    const retryTimer = window.setInterval(() => {
      const mux = playerRef.current;
      const native = document.querySelector(
        "[data-landing-native-video]"
      ) as HTMLVideoElement | null;
      if (mux) tryPlay(mux);
      if (native) tryPlay(native);
    }, 80);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 10000);
    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
    };
  }, [muxId, fileSrc, tryPlay]);

  return (
    <button
      type="button"
      className={`${styles.hero} ${revealed ? styles.heroDismissed : ""}`}
      onClick={revealed ? undefined : onReveal}
      aria-label={revealed ? undefined : "Enter sweetiepie"}
      tabIndex={revealed ? -1 : 0}
      disabled={revealed}
    >
      <div className={styles.media}>
        {posterUrl && showPoster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={posterUrl}
            alt=""
            className={styles.poster}
            aria-hidden
            fetchPriority="high"
            decoding="sync"
          />
        ) : null}
        {muxId ? (
          <MuxPlayer
            ref={playerRef}
            key={muxId}
            playbackId={muxId}
            streamType="on-demand"
            muted
            loop
            autoPlay
            playsInline
            preload="auto"
            poster=""
            placeholder=""
            startTime={0}
            minPreloadSegments={1}
            initialBandwidthEstimateKbps={10000}
            minResolution={MinResolution.noLessThan1080p}
            maxResolution={MaxResolution.upTo2160p}
            nohotkeys
            proudlyDisplayMuxBadge={false}
            videoTitle="sweetiepie landing"
            className={`${styles.video} ${styles.muxPlayer}`}
            onLoadedMetadata={(event) =>
              tryPlay(event.currentTarget as MuxPlayerElement)
            }
            onCanPlay={(event) => tryPlay(event.currentTarget as MuxPlayerElement)}
            onPlaying={(event) => tryPlay(event.currentTarget as MuxPlayerElement)}
            onTimeUpdate={handleMuxTimeUpdate}
          />
        ) : (
          <video
            key={fileSrc}
            data-landing-native-video
            className={styles.video}
            src={fileSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            onCanPlay={(event) => tryPlay(event.currentTarget)}
            onPlaying={(event) => tryPlay(event.currentTarget)}
            onTimeUpdate={handleNativeTimeUpdate}
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
