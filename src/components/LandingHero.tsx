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
import {
  getNativeVideoFromMedia,
  LandingPixelLoader,
} from "./LandingPixelLoader";
import styles from "./LandingHero.module.css";

type LandingHeroProps = {
  landing: LandingVideo;
  revealed: boolean;
  onReveal: () => void;
};

type MediaElement = HTMLVideoElement | MuxPlayerElement;

export function LandingHero({
  landing,
  revealed,
  onReveal,
}: LandingHeroProps) {
  const playerRef = useRef<MuxPlayerElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [nativeVideo, setNativeVideo] = useState<HTMLVideoElement | null>(null);
  const [videoVisible, setVideoVisible] = useState(false);
  const [useMp4Fallback, setUseMp4Fallback] = useState(false);
  const [startResolve, setStartResolve] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(true);
  const isPortrait = useStablePortraitOrientation();
  const isMobile = useIsMobileLanding();

  const muxId = (
    isPortrait ? landing.portraitPlaybackId : landing.landscapePlaybackId
  ).trim();
  const mp4Src = muxId ? getLandingMp4Url(muxId) : "";
  const fileSrc = isPortrait
    ? LANDING_VIDEO_FILES.portrait
    : LANDING_VIDEO_FILES.landscape;

  const syncNativeVideo = useCallback(() => {
    const native = videoRef.current;
    const mux = playerRef.current;
    const resolved = native ?? getNativeVideoFromMedia(mux);
    setNativeVideo((current) => (current === resolved ? current : resolved));
  }, []);

  const tryPlay = useCallback((media: MediaElement) => {
    if (media.paused) {
      media.play().catch(() => {});
    }
  }, []);

  const tryStartResolve = useCallback(
    (media: MediaElement) => {
      if (startResolve || videoVisible || media.paused) return;

      if (media.currentTime > 0.12) {
        try {
          media.currentTime = 0;
        } catch {
          /* ignore seek errors */
        }
        return;
      }

      if (media.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;

      const beginResolve = () => {
        try {
          if (media.currentTime > 0.01) {
            media.currentTime = 0;
          }
          media.pause();
        } catch {
          /* ignore seek/pause errors */
        }
        setStartResolve(true);
      };

      if ("requestVideoFrameCallback" in media) {
        media.requestVideoFrameCallback(beginResolve);
        return;
      }

      beginResolve();
    },
    [startResolve, videoVisible]
  );

  const handleMediaReady = useCallback(
    (media: MediaElement) => {
      syncNativeVideo();
      try {
        if (media.currentTime > 0.01) {
          media.currentTime = 0;
        }
      } catch {
        /* ignore seek errors before data is ready */
      }
      tryPlay(media);
    },
    [syncNativeVideo, tryPlay]
  );

  useEffect(() => {
    setVideoVisible(false);
    setUseMp4Fallback(false);
    setStartResolve(false);
    setOverlayVisible(true);
    setNativeVideo(null);
  }, [muxId, isPortrait]);

  useEffect(() => {
    syncNativeVideo();
    const timer = window.setInterval(syncNativeVideo, 150);
    return () => window.clearInterval(timer);
  }, [muxId, useMp4Fallback, syncNativeVideo]);

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

  const handleResolveProgress = useCallback((progress: number) => {
    if (progress > 0.02) {
      setVideoVisible(true);
    }
  }, []);

  const handleResolveComplete = useCallback(() => {
    setOverlayVisible(false);
    setVideoVisible(true);
    const mux = playerRef.current;
    const native = videoRef.current;
    if (mux) tryPlay(mux);
    if (native) tryPlay(native);
  }, [tryPlay]);

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
  const showPixelLoader = overlayVisible && !revealed;

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
        <LandingPixelLoader
          video={nativeVideo}
          visible={showPixelLoader}
          startResolve={startResolve}
          onResolveProgress={handleResolveProgress}
          onResolveComplete={handleResolveComplete}
        />
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
            onLoadedMetadata={(event) => {
              handleMediaReady(event.currentTarget as MuxPlayerElement);
            }}
            onLoadedData={() => syncNativeVideo()}
            onCanPlay={(event) => tryPlay(event.currentTarget as MuxPlayerElement)}
            onPlaying={(event) => {
              const media = event.currentTarget as MuxPlayerElement;
              syncNativeVideo();
              tryPlay(media);
              tryStartResolve(media);
            }}
            onTimeUpdate={(event) =>
              tryStartResolve(event.currentTarget as MuxPlayerElement)
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
            onLoadedData={() => syncNativeVideo()}
            onCanPlay={(event) => tryPlay(event.currentTarget)}
            onPlaying={(event) => {
              syncNativeVideo();
              tryPlay(event.currentTarget);
              tryStartResolve(event.currentTarget);
            }}
            onTimeUpdate={(event) => tryStartResolve(event.currentTarget)}
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
