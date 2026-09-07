"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MuxPlayer, { MaxResolution, MinResolution } from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { LandingVideo } from "@/lib/landing-video";
import {
  getLandingMp4Url,
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const posterHiddenRef = useRef(false);
  const [showPoster, setShowPoster] = useState(true);
  const [useMp4Fallback, setUseMp4Fallback] = useState(false);
  const isPortrait = useStablePortraitOrientation();

  const muxId = (
    isPortrait ? landing.portraitPlaybackId : landing.landscapePlaybackId
  ).trim();
  const mp4Src = muxId ? getLandingMp4Url(muxId) : "";
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

  const hidePoster = useCallback(() => {
    if (posterHiddenRef.current) return;
    posterHiddenRef.current = true;
    setShowPoster(false);
  }, []);

  const maybeHidePoster = useCallback(
    (media: HTMLVideoElement | MuxPlayerElement) => {
      if (
        posterHiddenRef.current ||
        media.paused ||
        media.readyState < HTMLMediaElement.HAVE_FUTURE_DATA ||
        media.currentTime <= 0.04
      ) {
        return;
      }

      hidePoster();
    },
    [hidePoster]
  );

  const tryPlay = useCallback((media: HTMLVideoElement | MuxPlayerElement) => {
    if (media.paused) {
      media.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    posterHiddenRef.current = false;
    setShowPoster(true);
    setUseMp4Fallback(false);
  }, [muxId, isPortrait]);

  useEffect(() => {
    const retryTimer = window.setInterval(() => {
      const mux = playerRef.current;
      const native = videoRef.current;
      if (mux) tryPlay(mux);
      if (native) tryPlay(native);
    }, 100);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 12000);
    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
    };
  }, [muxId, useMp4Fallback, tryPlay]);

  const handleReveal = () => {
    if (!revealed) onReveal();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (revealed) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onReveal();
    }
  };

  return (
    <div
      data-landing-hero=""
      data-landing-active={revealed ? undefined : ""}
      className={`${styles.hero} ${revealed ? styles.heroDismissed : ""}`}
      onClick={handleReveal}
      onKeyDown={handleKeyDown}
      role={revealed ? undefined : "button"}
      tabIndex={revealed ? -1 : 0}
      aria-label={revealed ? undefined : "Enter sweetiepie"}
    >
      <div className={styles.media}>
        {posterUrl && showPoster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={posterUrl}
            src={posterUrl}
            alt=""
            className={styles.poster}
            aria-hidden
            fetchPriority="high"
            decoding="sync"
          />
        ) : null}
        {muxId && !useMp4Fallback ? (
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
            onTimeUpdate={(event) =>
              maybeHidePoster(event.currentTarget as MuxPlayerElement)
            }
            onError={() => {
              if (mp4Src) setUseMp4Fallback(true);
            }}
          />
        ) : (
          <video
            ref={videoRef}
            key={useMp4Fallback ? mp4Src : fileSrc}
            data-landing-native-video
            className={styles.video}
            src={useMp4Fallback ? mp4Src : fileSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            onCanPlay={(event) => tryPlay(event.currentTarget)}
            onPlaying={(event) => tryPlay(event.currentTarget)}
            onTimeUpdate={(event) => maybeHidePoster(event.currentTarget)}
          />
        )}
      </div>
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <h1 className={styles.title}>sweetiepie</h1>
        <span className={styles.hint}>Click to enter</span>
      </div>
    </div>
  );
}
