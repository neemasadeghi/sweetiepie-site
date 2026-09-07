"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { attachLandingPlayback } from "@/lib/landing-playback";
import type { LandingPlaybackHandle } from "@/lib/landing-playback";
import styles from "./LandingHero.module.css";

const CROSSFADE_MS = 120;
const START_GUARD_SEC = 0.2;

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
  const handlesRef = useRef<Map<HTMLVideoElement, LandingPlaybackHandle>>(new Map());

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
    if (video.paused || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }
    if (video.currentTime > START_GUARD_SEC) return;

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

    crossfade();
  }, []);

  const smoothLoop = useCallback((media: HTMLVideoElement) => {
    const { duration, currentTime } = media;
    if (!duration || !Number.isFinite(duration) || currentTime < 0.75) return;
    if (duration - currentTime <= 0.035) {
      media.currentTime = 0.001;
    }
  }, []);

  const bindVideos = useCallback((root: HTMLElement) => {
    handlesRef.current.forEach((handle) => handle.destroy());
    handlesRef.current.clear();

    const videos = Array.from(root.querySelectorAll("video"));
    for (const video of videos) {
      if (!video.dataset.muxPlaybackId && !video.dataset.mp4Fallback) continue;

      const handle = attachLandingPlayback(video);
      if (handle) {
        handlesRef.current.set(video, handle);
        handle.play();
      }
    }
  }, []);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    resetLayers(root);
    bindVideos(root);

    return () => {
      handlesRef.current.forEach((handle) => handle.destroy());
      handlesRef.current.clear();
    };
  }, [bindVideos, resetLayers]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const tryPlay = () => {
      const video = activeVideo(root);
      if (!video) return;
      const handle = handlesRef.current.get(video);
      if (handle) {
        handle.play();
        return;
      }
      if (video.paused) {
        if (video.currentTime > 0.12) video.currentTime = 0;
        video.play().catch(() => {});
      }
    };

    const onTimeUpdate = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement;
      smoothLoop(video);
      revealPlayback(root, video);
    };

    const onPlaying = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement;
      if (video.currentTime > 0.12) video.currentTime = 0;
      revealPlayback(root, video);
    };

    const onOrientationChange = () => {
      resetLayers(root);
      bindVideos(root);
      tryPlay();
    };

    const videos = Array.from(root.querySelectorAll("video"));
    for (const video of videos) {
      video.addEventListener("timeupdate", onTimeUpdate);
      video.addEventListener("playing", onPlaying);
      video.addEventListener("canplay", tryPlay);
    }

    const orientationQuery = window.matchMedia("(orientation: portrait)");
    orientationQuery.addEventListener("change", onOrientationChange);

    tryPlay();
    const retryTimer = window.setInterval(tryPlay, 60);
    const stopTimer = window.setTimeout(() => {
      window.clearInterval(retryTimer);
    }, 12000);

    return () => {
      window.clearInterval(retryTimer);
      window.clearTimeout(stopTimer);
      orientationQuery.removeEventListener("change", onOrientationChange);
      for (const video of videos) {
        video.removeEventListener("timeupdate", onTimeUpdate);
        video.removeEventListener("playing", onPlaying);
        video.removeEventListener("canplay", tryPlay);
      }
    };
  }, [bindVideos, resetLayers, revealPlayback, smoothLoop]);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName !== "opacity") return;
      const target = event.target as HTMLElement;
      if (
        !target.matches("[data-landing-poster]") ||
        !target.classList.contains(styles.posterHidden)
      ) {
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
