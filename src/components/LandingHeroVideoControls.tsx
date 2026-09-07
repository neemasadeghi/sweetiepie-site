"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import styles from "./LandingHero.module.css";

function isVisibleVideo(video: HTMLVideoElement) {
  return window.getComputedStyle(video).display !== "none";
}

function activeVideo(root: HTMLElement) {
  const videos = Array.from(root.querySelectorAll("video"));
  return videos.find(isVisibleVideo) ?? videos[0] ?? null;
}

export function LandingHeroVideoControls({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const posterHiddenRef = useRef(false);

  const hidePoster = useCallback((root: HTMLElement) => {
    if (posterHiddenRef.current) return;
    posterHiddenRef.current = true;
    root.querySelectorAll("[data-landing-poster]").forEach((node) => {
      node.classList.add(styles.posterHidden);
    });
  }, []);

  const resetPoster = useCallback((root: HTMLElement) => {
    posterHiddenRef.current = false;
    root.querySelectorAll("[data-landing-poster]").forEach((node) => {
      node.classList.remove(styles.posterHidden);
    });
  }, []);

  const tryPlay = useCallback((video: HTMLVideoElement) => {
    if (video.currentTime > 0.15) {
      video.currentTime = 0;
    }
    if (video.paused) {
      video.play().catch(() => {});
    }
  }, []);

  const onPlayback = useCallback(
    (root: HTMLElement, video: HTMLVideoElement) => {
      if (!isVisibleVideo(video)) return;
      if (
        !video.paused &&
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
        video.currentTime >= 0
      ) {
        hidePoster(root);
      }
    },
    [hidePoster]
  );

  const smoothLoop = useCallback((video: HTMLVideoElement) => {
    const { duration, currentTime } = video;
    if (!duration || !Number.isFinite(duration) || currentTime < 1) return;
    if (duration - currentTime <= 0.05) {
      video.currentTime = 0.001;
    }
  }, []);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    resetPoster(root);
    const video = activeVideo(root);
    if (video) tryPlay(video);
  }, [resetPoster, tryPlay]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const handleTimeUpdate = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement;
      smoothLoop(video);
      onPlayback(root, video);
    };

    const handlePlaying = (event: Event) => {
      onPlayback(root, event.currentTarget as HTMLVideoElement);
    };

    const handleCanPlay = (event: Event) => {
      tryPlay(event.currentTarget as HTMLVideoElement);
    };

    const onOrientationChange = () => {
      resetPoster(root);
      const video = activeVideo(root);
      if (video) tryPlay(video);
    };

    const videos = Array.from(root.querySelectorAll("video"));
    for (const video of videos) {
      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("playing", handlePlaying);
      video.addEventListener("canplay", handleCanPlay);
      video.addEventListener("loadeddata", handleCanPlay);
    }

    const orientationQuery = window.matchMedia("(orientation: portrait)");
    orientationQuery.addEventListener("change", onOrientationChange);

    const retryTimer = window.setInterval(() => {
      const video = activeVideo(root);
      if (video) tryPlay(video);
    }, 60);

    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 12000);

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
      orientationQuery.removeEventListener("change", onOrientationChange);
      for (const video of videos) {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("playing", handlePlaying);
        video.removeEventListener("canplay", handleCanPlay);
        video.removeEventListener("loadeddata", handleCanPlay);
      }
    };
  }, [onPlayback, resetPoster, smoothLoop, tryPlay]);

  return (
    <div ref={ref} className={styles.videoControls}>
      {children}
    </div>
  );
}
