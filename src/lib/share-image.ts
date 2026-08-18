import type { Project } from "@/components/ProjectCard";

type ShareProject = Pick<
  Project,
  "client" | "subtitle" | "format" | "director" | "cinematographer" | "stillUrl" | "shareImageUrl"
>;

/** Curated project still — same source as the grid (like neema.film), not a Mux frame. */
export function getProjectShareImage(project: ShareProject): string {
  return project.shareImageUrl || project.stillUrl;
}

export function getProjectShareTitle(project: ShareProject): string {
  const detail = project.subtitle || project.format;
  return detail ? `${project.client} — ${detail}` : project.client;
}

export function getProjectShareDescription(project: ShareProject): string {
  const parts = [
    project.director ? `dir. ${project.director}` : "",
    project.cinematographer ? `dp ${project.cinematographer}` : "",
    project.format,
  ].filter(Boolean);
  return parts.join(" · ") || "sweetiepie — Director";
}
