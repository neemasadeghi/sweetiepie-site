import type { Metadata } from "next";
import type { Project } from "@/components/ProjectCard";
import type { LandingVideo } from "@/lib/landing-video";
import { filterProjectsByCategory } from "@/lib/filter-projects";
import { getProjectShareImage } from "@/lib/share-image";
import {
  SITE_HEADLINE,
  SITE_NAME,
  SITE_SHARE_DESCRIPTION,
  SITE_TAGLINE,
} from "@/lib/site-brand";
import { getSiteUrl } from "@/lib/site-url";
import { WORK_PATH_TO_CATEGORY } from "@/lib/work-paths";

function getLandingShareImage(landing: LandingVideo): string | undefined {
  const playbackId = landing.landscapePlaybackId.trim();
  if (!playbackId) return undefined;
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=1200&height=630&fit_mode=smartcrop&time=1`;
}

function shareImageMeta(imageUrl: string, alt: string) {
  return {
    url: imageUrl,
    secureUrl: imageUrl,
    alt,
    width: 1200,
    height: 630,
    type: "image/jpeg" as const,
  };
}

export function metadataForHome(
  projects: Project[] | null,
  landing: LandingVideo
): Metadata {
  const imageUrl =
    getLandingShareImage(landing) ||
    (projects?.[0] ? getProjectShareImage(projects[0]) : undefined);
  const shareImage = imageUrl
    ? shareImageMeta(imageUrl, `${SITE_HEADLINE} — preview`)
    : undefined;

  return {
    title: { absolute: SITE_HEADLINE },
    description: `${SITE_TAGLINE} — ${SITE_SHARE_DESCRIPTION}`,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      title: SITE_HEADLINE,
      description: SITE_SHARE_DESCRIPTION,
      url: getSiteUrl(),
      siteName: SITE_NAME,
      locale: "en_US",
      ...(shareImage ? { images: [shareImage] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_HEADLINE,
      description: SITE_SHARE_DESCRIPTION,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export function metadataForWorkPath(
  path: string,
  pageTitle: string,
  projects: Project[] | null
): Metadata {
  const category = WORK_PATH_TO_CATEGORY[path] ?? null;
  const featured = projects
    ? filterProjectsByCategory(projects, category)[0]
    : undefined;
  const description = `${SITE_TAGLINE} — ${SITE_SHARE_DESCRIPTION}`;
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
      siteName: SITE_NAME,
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
