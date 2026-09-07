"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

function getVideoElement(node: EventTarget | null): HTMLVideoElement | null {
  if (!node || !(node instanceof HTMLVideoElement)) return null;
  return node;
}

export function LandingHero({ landing, revealed, onReveal }: LandingHeroProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const posterHiddenRef = useRef(false);
  const [showPoster, setShowPoster] = useState(true);
  const isPortrait = useStablePortraitOrientation();

  const muxId = (
    isPortrait ? landing.portraitPlaybackId : landing.landscapePlaybackId
  ).trim();
  const videoSrc = muxId
    ? getLandingMp4Url(muxId)
    : isPortrait
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
    (video: HTMLVideoElement) => {
      if (posterHiddenRef.current || video.paused || video.currentTime > 0.12) {
        return;
      }

      if ("requestVideoFrameCallback" in video) {
        video.requestVideoFrameCallback(() => {
          if (
            !posterHiddenRef.current &&
            !video.paused &&
            video.currentTime < 0.12
          ) {
            hidePoster();
          }
        });
        return;
      }

      hidePoster();
    },
    [hidePoster]
  );

  const tryPlay = useCallback((video: HTMLVideoElement) => {
    if (video.paused) {
      video.play().catch(() => {});
    }
  }, []);

  useEffect(() => {
    posterHiddenRef.current = false;
    setShowPoster(true);
  }, [videoSrc]);

  useEffect(() => {
    const retryTimer = window.setInterval(() => {
      const video = videoRef.current;
      if (video) tryPlay(video);
    }, 100);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 10000);
    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
    };
  }, [videoSrc, tryPlay]);

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
        <video
          ref={videoRef}
          key={videoSrc}
          data-landing-native-video
          className={styles.video}
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
          onLoadedData={(event) => {
            const video = getVideoElement(event.currentTarget);
            if (video) tryPlay(video);
          }}
          onCanPlay={(event) => {
            const video = getVideoElement(event.currentTarget);
            if (video) tryPlay(video);
          }}
          onPlaying={(event) => {
            const video = getVideoElement(event.currentTarget);
            if (video) maybeHidePoster(video);
          }}
          onTimeUpdate={(event) => {
            const video = getVideoElement(event.currentTarget);
            if (video) maybeHidePoster(video);
          }}
        />
      </div>
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <h1 className={styles.title}>sweetiepie</h1>
        <span className={styles.hint}>Click to enter</span>
      </div>
    </button>
  );
}
