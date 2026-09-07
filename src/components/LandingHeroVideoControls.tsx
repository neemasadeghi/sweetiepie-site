"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "./LandingHero.module.css";

const MOTION_THRESHOLD_SEC = 0.08;

function isVisibleVideo(video: HTMLVideoElement) {
  return window.getComputedStyle(video).display !== "none";
}

export function LandingHeroVideoControls({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const posterHiddenRef = useRef(false);

  const hidePosters = useCallback((root: HTMLElement) => {
    if (posterHiddenRef.current) return;
    posterHiddenRef.current = true;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.querySelectorAll("[data-landing-poster]").forEach((node) => {
          node.classList.add(styles.posterHidden);
        });
      });
    });
  }, []);

  const smoothLoop = useCallback((media: HTMLVideoElement) => {
    const { duration, currentTime } = media;
    if (!duration || !Number.isFinite(duration) || currentTime < 0.5) return;
    if (duration - currentTime <= 0.04) {
      media.currentTime = 0.001;
    }
  }, []);

  const markPlayback = useCallback(
    (root: HTMLElement, video: HTMLVideoElement) => {
      if (!isVisibleVideo(video)) return;
      if (
        !video.paused &&
        video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA &&
        video.currentTime > MOTION_THRESHOLD_SEC
      ) {
        hidePosters(root);
      }
    },
    [hidePosters]
  );

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const videos = Array.from(root.querySelectorAll("video"));
    if (!videos.length) return;

    posterHiddenRef.current = false;
    root.querySelectorAll("[data-landing-poster]").forEach((node) => {
      node.classList.remove(styles.posterHidden);
    });

    const tryPlay = () => {
      for (const video of videos) {
        if (isVisibleVideo(video) && video.paused) {
          video.play().catch(() => {});
        }
      }
    };

    const onTimeUpdate = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement;
      smoothLoop(video);
      markPlayback(root, video);
    };

    const onPlaying = (event: Event) => {
      markPlayback(root, event.currentTarget as HTMLVideoElement);
    };

    for (const video of videos) {
      video.addEventListener("timeupdate", onTimeUpdate);
      video.addEventListener("playing", onPlaying);
      video.addEventListener("canplay", tryPlay);
      video.addEventListener("loadeddata", tryPlay);
    }

    tryPlay();
    const retryTimer = window.setInterval(tryPlay, 80);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 10000);

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
      for (const video of videos) {
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("canplay", tryPlay);
        video.removeEventListener("loadeddata", tryPlay);
      }
    };
  }, [markPlayback, smoothLoop]);

  return (
    <div ref={ref} className={styles.videoControls}>
      {children}
    </div>
  );
}
