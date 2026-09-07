"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const playStartedRef = useRef(false);
  const [showPoster, setShowPoster] = useState(true);
  const [mp4Tier, setMp4Tier] = useState<"high" | "highest">("high");
  const isPortrait = useStablePortraitOrientation();

  const muxId = (
    isPortrait ? landing.portraitPlaybackId : landing.landscapePlaybackId
  ).trim();
  const videoSrc = muxId
    ? getLandingMp4Url(muxId, mp4Tier)
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

  const startPlayback = useCallback((video: HTMLVideoElement) => {
    if (playStartedRef.current || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }

    playStartedRef.current = true;
    video.play().catch(() => {
      playStartedRef.current = false;
    });
  }, []);

  useEffect(() => {
    posterHiddenRef.current = false;
    playStartedRef.current = false;
    setShowPoster(true);
    setMp4Tier("high");
  }, [muxId, isPortrait]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onReady = () => startPlayback(video);

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("canplay", onReady);

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      onReady();
    } else {
      video.load();
    }

    return () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
    };
  }, [videoSrc, startPlayback]);

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
          onLoadedMetadata={(event) => {
            const video = getVideoElement(event.currentTarget);
            if (!video) return;
            try {
              video.currentTime = 0;
            } catch {
              /* ignore seek errors before data is ready */
            }
          }}
          onLoadedData={(event) => {
            const video = getVideoElement(event.currentTarget);
            if (video) startPlayback(video);
          }}
          onCanPlay={(event) => {
            const video = getVideoElement(event.currentTarget);
            if (video) startPlayback(video);
          }}
          onError={() => {
            if (mp4Tier === "high") {
              playStartedRef.current = false;
              setMp4Tier("highest");
            }
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
