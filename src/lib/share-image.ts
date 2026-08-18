import type { Project } from "@/components/ProjectCard";

type ShareProject = Pick<
  Project,
  "client" | "subtitle" | "format" | "director" | "cinematographer" | "stillUrl" | "shareImageUrl" | "muxPlaybackId"
>;

/** Frame from the preview video (Mux) or the project still — sized for link previews. */
export function getProjectShareImage(project: ShareProject): string {
  const muxId = project.muxPlaybackId?.trim();
  if (muxId) {
    return `https://image.mux.com/${muxId}/thumbnail.jpg?width=1200&height=630&fit_mode=smartcrop&time=1`;
  }
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
