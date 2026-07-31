"use client";

import { usePathname } from "next/navigation";
import type { Project } from "./ProjectCard";
import { ProjectList } from "./ProjectList";
import { SiteScrollManager } from "./SiteScrollManager";
import {
  isWorkPathname,
  WORK_PATH_TO_CATEGORY,
} from "@/lib/work-paths";

function UnderConstruction() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "var(--font-body)",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          fontWeight: 700,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          marginBottom: "1rem",
        }}
      >
        Under Construction
      </h1>
      <p
        style={{
          fontSize: "1rem",
          fontWeight: 300,
          color: "var(--text-secondary)",
          maxWidth: "400px",
          lineHeight: 1.6,
        }}
      >
        This site is being updated and will be back in a few hours. Check back
        soon.
      </p>
    </div>
  );
}

export function WorkArea({
  projects,
  children,
}: {
  projects: Project[] | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <SiteScrollManager />
      {isWorkPathname(pathname) ? (
        !projects ? (
          <UnderConstruction />
        ) : (
          <ProjectList
            projects={projects}
            activeCategory={WORK_PATH_TO_CATEGORY[pathname] ?? null}
            animated
          />
        )
      ) : (
        children
      )}
    </>
  );
}
