"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MuxPlayer, { MaxResolution, MinResolution } from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { LandingVideo } from "@/lib/landing-video";
import {
  getLandingPosterUrl,
  LANDING_VIDEO_FILES,
} from "@/lib/landing-video";
import { useStablePortraitOrientation } from "@/hooks/useStablePortraitOrientation";
import styles from "./LandingHero.module.css";

type LandingHeroProps = {
  landing: LandingVideo;
  revealed: boolean;
  onReveal: () => void;
};

export function LandingHero({ landing, revealed, onReveal }: LandingHeroProps) {
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const [showPoster, setShowPoster] = useState(true);
  const isPortrait = useStablePortraitOrientation();

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
        media.currentTime > 0.08
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

  useEffect(() => {
    setShowPoster(true);
  }, [muxId]);

  return (
    <button
      type="button"
      data-landing-hero=""
      data-landing-active={revealed ? undefined : ""}
      className={`${styles.hero} ${revealed ? styles.heroDismissed : ""}`}
      onClick={revealed ? undefined : onReveal}
      aria-label={revealed ? undefined : "Enter sweetiepie"}
      tabIndex={revealed ? -1 : 0}
      disabled={revealed}
    >
      <div className={styles.media}>
        {posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={posterUrl}
            src={posterUrl}
            alt=""
            className={`${styles.poster} ${showPoster ? "" : styles.posterHidden}`}
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
            className={`${styles.video} ${styles.muxPlayer} ${showPoster ? styles.videoHidden : styles.videoVisible}`}
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
            className={`${styles.video} ${showPoster ? styles.videoHidden : styles.videoVisible}`}
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
