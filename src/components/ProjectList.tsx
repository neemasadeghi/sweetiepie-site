"use client";

import { useMemo, useSyncExternalStore } from "react";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import { ProjectCard, type Project } from "./ProjectCard";
import { filterProjectsByCategory } from "@/lib/filter-projects";
import styles from "./ProjectList.module.css";

type ProjectListProps = {
  projects: Project[];
  activeCategory: string | null;
  /** When true, cards animate layout when the filtered set changes (same layout instance). */
  animated?: boolean;
};

function slideUpFromBelowPx(): number {
  if (typeof window === "undefined") return 640;
  return Math.round(Math.min(window.innerHeight * 0.72, 920));
}

const subscribeResize = (onStoreChange: () => void) => {
  window.addEventListener("resize", onStoreChange);
  return () => window.removeEventListener("resize", onStoreChange);
};

function useEnterFromBelowY(): number {
  return useSyncExternalStore(
    subscribeResize,
    slideUpFromBelowPx,
    () => 640
  );
}

export function ProjectList({
  projects,
  activeCategory,
  animated = false,
}: ProjectListProps) {
  const enterY = useEnterFromBelowY();

  const visible = useMemo(
    () => filterProjectsByCategory(projects, activeCategory),
    [projects, activeCategory]
  );

  if (visible.length === 0) {
    return (
      <section className={styles.section}>
        <p className={styles.empty}>No projects in this category yet.</p>
      </section>
    );
  }

  const grid = animated ? (
    <LayoutGroup>
      <div className={styles.grid}>
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project) => (
            <motion.div
              key={project._id}
              layout="position"
              layoutId={project._id}
              initial={{ opacity: 0, y: enterY }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 64 }}
              transition={{
                layout: { type: "spring", stiffness: 300, damping: 32 },
                opacity: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
                y: { type: "spring", stiffness: 280, damping: 30, mass: 0.9 },
              }}
              className={styles.cardWrap}
            >
              <ProjectCard project={project} showDirector={false} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </LayoutGroup>
  ) : (
    <div className={styles.grid}>
      {visible.map((project) => (
        <div key={project._id} className={styles.cardWrap}>
          <ProjectCard project={project} showDirector={false} />
        </div>
      ))}
    </div>
  );

  return <section className={styles.section}>{grid}</section>;
}
