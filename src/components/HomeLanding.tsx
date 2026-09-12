"use client";

import { useCallback, useLayoutEffect } from "react";
import type { Project } from "./ProjectCard";
import { ProjectList } from "./ProjectList";
import { LandingHero } from "./LandingHero";
import styles from "./HomeLanding.module.css";
import type { LandingVideo } from "@/lib/landing-video";
import {
  notifyLandingRevealed,
  useLandingOverlayActive,
} from "@/hooks/useLandingOverlay";

export function HomeLanding({
  projects,
  landing,
}: {
  projects: Project[];
  landing: LandingVideo;
}) {
  const landingOverlayActive = useLandingOverlayActive();
  const revealed = !landingOverlayActive;

  const reveal = useCallback(() => {
    notifyLandingRevealed();
  }, []);

  useLayoutEffect(() => {
    if (revealed) {
      window.scrollTo(0, 0);
    }
  }, [revealed]);

  return (
    <>
      <LandingHero
        landing={landing}
        revealed={revealed}
        onReveal={reveal}
      />
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
