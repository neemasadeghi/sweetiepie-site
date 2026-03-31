"use client";

import { useState } from "react";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import { ProjectCard, type Project } from "./ProjectCard";
import styles from "./WorkGrid.module.css";

const FILTERS = [
  { key: "selected", label: "Selected" },
  { key: "music-video", label: "Music Video" },
  { key: "commercial", label: "Commercial" },
  { key: "narrative", label: "Narrative" },
];

export function WorkGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("selected");

  const filtered =
    active === "all"
      ? projects
      : projects.filter((p) => p.category.includes(active));

  return (
    <section className={styles.work} id="work">
      <div className={styles.filters}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`${styles.filterBtn} ${active === f.key ? styles.filterActive : ""}`}
            onClick={() => setActive(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>
      <LayoutGroup>
        <div className={styles.grid}>
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={project._id}
                layout="position"
                layoutId={project._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{
                  layout: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.25 },
                }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </LayoutGroup>
    </section>
  );
}
