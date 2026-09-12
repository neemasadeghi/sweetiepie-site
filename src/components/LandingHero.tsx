"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MuxPlayer, { MaxResolution, MinResolution } from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import type { LandingVideo } from "@/lib/landing-video";
import {
  getLandingMp4Url,
  LANDING_VIDEO_FILES,
} from "@/lib/landing-video";
import { useIsMobileLanding } from "@/hooks/useLandingPlayback";
import { useStablePortraitOrientation } from "@/hooks/useStablePortraitOrientation";
import styles from "./LandingHero.module.css";

type LandingHeroProps = {
  landing: LandingVideo;
  revealed: boolean;
  onReveal: () => void;
};

type MediaElement = HTMLVideoElement | MuxPlayerElement;

export function LandingHero({ landing, revealed, onReveal }: LandingHeroProps) {
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoVisible, setVideoVisible] = useState(false);
  const [useMp4Fallback, setUseMp4Fallback] = useState(false);
  const isPortrait = useStablePortraitOrientation();
  const isMobile = useIsMobileLanding();

  const muxId = (
    isPortrait ? landing.portraitPlaybackId : landing.landscapePlaybackId
  ).trim();
  const mp4Src = muxId ? getLandingMp4Url(muxId) : "";
  const fileSrc = isPortrait
    ? LANDING_VIDEO_FILES.portrait
    : LANDING_VIDEO_FILES.landscape;

  const tryPlay = useCallback((media: MediaElement) => {
    if (media.paused) {
      media.play().catch(() => {});
    }
  }, []);

  const tryRevealVideo = useCallback(
    (media: MediaElement) => {
      if (videoVisible || media.paused) return;

      if (media.currentTime > 0.12) {
        try {
          media.currentTime = 0;
        } catch {
          /* ignore seek errors */
        }
        return;
      }

      if (media.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;

      const reveal = () => setVideoVisible(true);

      if ("requestVideoFrameCallback" in media) {
        media.requestVideoFrameCallback(reveal);
        return;
      }

      reveal();
    },
    [videoVisible]
  );

  const handleMediaReady = useCallback(
    (media: MediaElement) => {
      try {
        if (media.currentTime > 0.01) {
          media.currentTime = 0;
        }
      } catch {
        /* ignore seek errors before data is ready */
      }
      tryPlay(media);
    },
    [tryPlay]
  );

  useEffect(() => {
    setVideoVisible(false);
    setUseMp4Fallback(false);
  }, [muxId, isPortrait]);

  useEffect(() => {
    const retryTimer = window.setInterval(() => {
      const mux = playerRef.current;
      const native = videoRef.current;
      if (mux && !videoVisible) tryPlay(mux);
      if (native && !videoVisible) tryPlay(native);
    }, 100);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 12000);
    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
    };
  }, [muxId, useMp4Fallback, videoVisible, tryPlay]);

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

  const videoClassName = `${styles.video} ${videoVisible ? styles.videoVisible : ""}`;

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
            initialBandwidthEstimateKbps={isMobile ? 2200 : 6000}
            {...(isMobile
              ? { maxResolution: MaxResolution.upTo1080p }
              : {
                  minResolution: MinResolution.noLessThan1080p,
                  maxResolution: MaxResolution.upTo2160p,
                })}
            nohotkeys
            proudlyDisplayMuxBadge={false}
            videoTitle="sweetiepie landing"
            className={`${videoClassName} ${styles.muxPlayer}`}
            onLoadedMetadata={(event) =>
              handleMediaReady(event.currentTarget as MuxPlayerElement)
            }
            onCanPlay={(event) => tryPlay(event.currentTarget as MuxPlayerElement)}
            onPlaying={(event) => {
              const media = event.currentTarget as MuxPlayerElement;
              tryPlay(media);
              tryRevealVideo(media);
            }}
            onTimeUpdate={(event) =>
              tryRevealVideo(event.currentTarget as MuxPlayerElement)
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
            className={videoClassName}
            src={useMp4Fallback ? mp4Src : fileSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            tabIndex={-1}
            onLoadedMetadata={(event) => handleMediaReady(event.currentTarget)}
            onCanPlay={(event) => tryPlay(event.currentTarget)}
            onPlaying={(event) => {
              tryPlay(event.currentTarget);
              tryRevealVideo(event.currentTarget);
            }}
            onTimeUpdate={(event) => tryRevealVideo(event.currentTarget)}
          />
        )}
      </div>
      <div className={styles.scrim} aria-hidden />
      <div className={styles.content}>
        <h1 className={styles.title}>sweetiepie</h1>
      </div>
    </div>
  );
}
