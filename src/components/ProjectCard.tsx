"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import MuxPlayer from "@mux/mux-player-react";
import type MuxPlayerElement from "@mux/mux-player";
import styles from "./ProjectCard.module.css";

export interface Project {
  _id: string;
  client: string;
  subtitle?: string;
  format?: string;
  slug: string;
  category: string[];
  stillUrl: string;
  hotspot?: { x: number; y: number };
  /** Mux looping preview (preferred) */
  muxPlaybackId?: string;
  /** Legacy Sanity file URL when no Mux preview */
  videoUrl?: string;
  vimeoTitle?: string;
  vimeoUrl?: string;
  additionalVideos?: { title?: string; url: string }[];
  gallery?: { imageUrl: string; caption?: string; link?: string }[];
  director?: string;
  cinematographer?: string;
  production?: string;
  imdbUrl?: string;
  watchPlatform?: string;
  watchUrl?: string;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return mobile;
}

export function ProjectCard({
  project,
  showDirector = true,
}: {
  project: Project;
  showDirector?: boolean;
}) {
  const muxRef = useRef<MuxPlayerElement | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const isMobile = useIsMobile();

  const muxId = project.muxPlaybackId?.trim() || "";
  const fileUrl = project.videoUrl?.trim() || "";
  const hasPreview = Boolean(muxId || fileUrl);

  const play = useCallback(() => {
    const mux = muxRef.current;
    const video = videoRef.current;
    if (muxId && mux) {
      mux.play().then(() => setPlaying(true)).catch(() => {});
      return;
    }
    if (fileUrl && video) {
      video.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [muxId, fileUrl]);

  const pause = useCallback(() => {
    const mux = muxRef.current;
    const video = videoRef.current;
    if (mux) {
      mux.pause();
      mux.currentTime = 0;
    }
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  useEffect(() => {
    if (!isMobile || !hasPreview || !cardRef.current) return;

    let delayTimer: ReturnType<typeof setTimeout> | null = null;
    const card = cardRef.current;

    const playObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          delayTimer = setTimeout(() => play(), 1500);
        } else {
          if (delayTimer) { clearTimeout(delayTimer); delayTimer = null; }
        }
      },
      { threshold: 0.5, rootMargin: "-10% 0px -10% 0px" }
    );

    const stopObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          if (delayTimer) { clearTimeout(delayTimer); delayTimer = null; }
          pause();
        }
      },
      { threshold: 1.0 }
    );

    playObserver.observe(card);
    stopObserver.observe(card);
    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      playObserver.disconnect();
      stopObserver.disconnect();
    };
  }, [isMobile, hasPreview, play, pause]);

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onMouseEnter={isMobile ? undefined : play}
      onMouseLeave={isMobile ? undefined : pause}
    >
      <Link href={`/project/${project.slug}`} className={styles.link}>
        <div className={styles.media}>
          <Image
            src={project.stillUrl}
            alt={project.client}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
            className={`${styles.still} ${playing ? styles.stillHidden : ""}`}
            style={project.hotspot ? {
              objectPosition: `${project.hotspot.x * 100}% ${project.hotspot.y * 100}%`,
            } : undefined}
          />
          {muxId ? (
            <MuxPlayer
              ref={muxRef}
              playbackId={muxId}
              streamType="on-demand"
              muted
              loop
              playsInline
              preload="none"
              nohotkeys
              proudlyDisplayMuxBadge={false}
              videoTitle={project.client}
              className={`${styles.video} ${styles.muxPlayer} ${playing ? styles.videoPlaying : ""}`}
            />
          ) : fileUrl ? (
            <video
              ref={videoRef}
              className={`${styles.video} ${playing ? styles.videoPlaying : ""}`}
              src={fileUrl}
              muted
              loop
              playsInline
              preload="none"
            />
          ) : null}
          <div className={`${styles.overlay} ${playing ? styles.overlayHidden : ""}`} />
        </div>
        <div className={styles.info}>
          <div className={styles.titles}>
            <h3 className={styles.client}>{project.client}</h3>
            {(project.subtitle || project.format) && (
              <span className={styles.subtitle}>
                {[project.subtitle, project.format].filter(Boolean).join(" / ")}
              </span>
            )}
          </div>
          {showDirector && project.director && (
            <span className={styles.director}>dir. {project.director}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
