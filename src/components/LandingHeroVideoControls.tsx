"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "./LandingHero.module.css";

export function LandingHeroVideoControls({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const smoothLoop = useCallback((media: HTMLVideoElement) => {
    const { duration, currentTime } = media;
    if (!duration || !Number.isFinite(duration) || currentTime < 0.5) return;
    if (duration - currentTime <= 0.04) {
      media.currentTime = 0.001;
    }
  }, []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const videos = Array.from(root.querySelectorAll("video"));
    if (!videos.length) return;

    const tryPlay = () => {
      for (const video of videos) {
        if (video.paused) {
          video.play().catch(() => {});
        }
      }
    };

    const onTimeUpdate = (event: Event) => {
      smoothLoop(event.currentTarget as HTMLVideoElement);
    };

    for (const video of videos) {
      video.addEventListener("timeupdate", onTimeUpdate);
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
        video.removeEventListener("canplay", tryPlay);
        video.removeEventListener("loadeddata", tryPlay);
      }
    };
  }, [smoothLoop]);

  return (
    <div ref={ref} className={styles.videoControls}>
      {children}
    </div>
  );
}
