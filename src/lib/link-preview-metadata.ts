import type { Metadata } from "next";
import type { Project } from "@/components/ProjectCard";
import { filterProjectsByCategory } from "@/lib/filter-projects";
import { getProjectShareImage } from "@/lib/share-image";
import { getSiteUrl } from "@/lib/site-url";
import { WORK_PATH_TO_CATEGORY } from "@/lib/work-paths";

export function metadataForWorkPath(
  path: string,
  pageTitle: string,
  projects: Project[] | null
): Metadata {
  const category = WORK_PATH_TO_CATEGORY[path] ?? null;
  const featured = projects
    ? filterProjectsByCategory(projects, category)[0]
    : undefined;
  const description = "Director — Music videos, commercials & documentary.";
  const imageUrl = featured ? getProjectShareImage(featured) : undefined;
  const shareImage = imageUrl
    ? {
        url: imageUrl,
        secureUrl: imageUrl,
        alt: featured ? `${featured.client} — project still` : pageTitle,
        width: 1200,
        height: 630,
        type: "image/jpeg" as const,
      }
    : undefined;

  return {
    title: pageTitle,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      title: pageTitle,
      description,
      url: `${getSiteUrl()}${path === "/" ? "" : path}`,
      siteName: "sweetiepie",
      locale: "en_US",
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}
