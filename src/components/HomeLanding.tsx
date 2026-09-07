"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Project } from "./ProjectCard";
import { ProjectList } from "./ProjectList";
import { LandingHero } from "./LandingHero";
import styles from "./HomeLanding.module.css";
import { notifyLandingRevealed } from "@/hooks/useLandingOverlay";

export function HomeLanding({
  projects,
  video,
}: {
  projects: Project[];
  video: ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  const reveal = useCallback(() => {
    setRevealed(true);
    notifyLandingRevealed();
  }, []);

  useEffect(() => {
    if (revealed) {
      document.body.style.overflow = "";
      delete document.documentElement.dataset.page;
      window.scrollTo(0, 0);
      return;
    }

    document.body.style.overflow = "hidden";
    document.documentElement.dataset.page = "landing";

    return () => {
      document.body.style.overflow = "";
      delete document.documentElement.dataset.page;
    };
  }, [revealed]);

  return (
    <>
      <LandingHero revealed={revealed} onReveal={reveal} video={video} />
      <div
        className={`${styles.work} ${revealed ? styles.workVisible : ""}`}
        id="work"
        aria-hidden={!revealed}
      >
        <ProjectList projects={projects} activeCategory={null} animated />
      </div>
    </>
  );
}
