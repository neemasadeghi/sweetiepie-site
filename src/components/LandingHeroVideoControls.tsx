"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "./LandingHero.module.css";

const MOTION_THRESHOLD_SEC = 0.05;
const CROSSFADE_MS = 480;

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
  const revealedRef = useRef(false);

  const resetLayers = useCallback((root: HTMLElement) => {
    revealedRef.current = false;
    root.querySelectorAll("video").forEach((video) => {
      video.classList.remove(styles.videoReady);
    });
    root.querySelectorAll("[data-landing-poster]").forEach((node) => {
      node.classList.remove(styles.posterHidden);
      (node as HTMLElement).style.visibility = "";
    });
  }, []);

  const revealPlayback = useCallback((root: HTMLElement, video: HTMLVideoElement) => {
    if (revealedRef.current || !isVisibleVideo(video)) return;
    if (
      video.paused ||
      video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA ||
      video.currentTime <= MOTION_THRESHOLD_SEC
    ) {
      return;
    }

    const crossfade = () => {
      if (revealedRef.current) return;
      revealedRef.current = true;
      video.classList.add(styles.videoReady);
      root.querySelectorAll("[data-landing-poster]").forEach((node) => {
        node.classList.add(styles.posterHidden);
      });
    };

    if ("requestVideoFrameCallback" in video) {
      video.requestVideoFrameCallback(() => crossfade());
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(crossfade);
    });
  }, []);

  const smoothLoop = useCallback((media: HTMLVideoElement) => {
    const { duration, currentTime } = media;
    if (!duration || !Number.isFinite(duration) || currentTime < 0.75) return;
    if (duration - currentTime <= 0.035) {
      media.currentTime = 0.001;
    }
  }, []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    resetLayers(root);

    const tryPlay = () => {
      const video = activeVideo(root);
      if (video?.paused) {
        video.play().catch(() => {});
      }
    };

    const onTimeUpdate = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement;
      smoothLoop(video);
      revealPlayback(root, video);
    };

    const onPlaying = (event: Event) => {
      revealPlayback(root, event.currentTarget as HTMLVideoElement);
    };

    const onOrientationChange = () => {
      resetLayers(root);
      tryPlay();
    };

    const videos = Array.from(root.querySelectorAll("video"));
    for (const video of videos) {
      video.addEventListener("timeupdate", onTimeUpdate);
      video.addEventListener("playing", onPlaying);
      video.addEventListener("canplay", tryPlay);
      video.addEventListener("loadeddata", tryPlay);
    }

    const orientationQuery = window.matchMedia("(orientation: portrait)");
    orientationQuery.addEventListener("change", onOrientationChange);

    tryPlay();
    const retryTimer = window.setInterval(tryPlay, 80);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 10000);

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
      orientationQuery.removeEventListener("change", onOrientationChange);
      for (const video of videos) {
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("canplay", tryPlay);
        video.removeEventListener("loadeddata", tryPlay);
      }
    };
  }, [resetLayers, revealPlayback, smoothLoop]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "opacity") return;
      const target = event.target as HTMLElement;
      if (!target.matches("[data-landing-poster]") || !target.classList.contains(styles.posterHidden)) {
        return;
      }
      target.style.visibility = "hidden";
    };

    root.addEventListener("transitionend", onTransitionEnd);
    return () => root.removeEventListener("transitionend", onTransitionEnd);
  }, []);

  return (
    <div
      ref={ref}
      className={styles.videoControls}
      style={{ ["--landing-crossfade-ms" as string]: `${CROSSFADE_MS}ms` }}
    >
      {children}
    </div>
  );
}
