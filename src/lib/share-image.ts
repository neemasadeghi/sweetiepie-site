import type { Project } from "@/components/ProjectCard";

type ShareProject = Pick<
  Project,
  "client" | "subtitle" | "format" | "director" | "cinematographer" | "stillUrl" | "shareImageUrl" | "slug"
>;

/** Homepage link preview still — Adidas Crazy Lite Shorts. */
export const HOME_SHARE_PROJECT_SLUG = "crazy-lite-shorts";

/** Curated project still — same source as the grid (like neema.film), not a Mux frame. */
export function getProjectShareImage(project: ShareProject): string {
  return project.shareImageUrl || project.stillUrl;
}

export function getHomeShareImage(projects: Project[] | null): string | null {
  if (!projects?.length) return null;
  const featured = projects.find((p) => p.slug === HOME_SHARE_PROJECT_SLUG);
  return featured ? getProjectShareImage(featured) : null;
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
  return parts.join(" · ") || "sweetiepie · director duo";
}
