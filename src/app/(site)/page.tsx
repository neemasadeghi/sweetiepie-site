import type { Metadata } from "next";
import { getProjects, getLandingVideo } from "@/lib/sanity-queries";
import { metadataForHome } from "@/lib/link-preview-metadata";
import { HomeLanding } from "@/components/HomeLanding";
import { LandingHeroEarlyVideo } from "@/components/LandingHeroEarlyVideo";
import { LandingHeroVideoControls } from "@/components/LandingHeroVideoControls";
import { LandingVideoPreload } from "@/components/LandingVideoPreload";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [projects, landing] = await Promise.all([
    getProjects(),
    getLandingVideo(),
  ]);

  return metadataForHome(projects, landing);
}

export default async function HomePage() {
  const [projects, landing] = await Promise.all([
    getProjects(),
    getLandingVideo(),
  ]);

  const video = (
    <LandingHeroVideoControls>
      <LandingHeroEarlyVideo
        landscapePlaybackId={landing.landscapePlaybackId}
        portraitPlaybackId={landing.portraitPlaybackId}
      />
    </LandingHeroVideoControls>
  );

  return (
    <>
      <LandingVideoPreload landing={landing} />
      <HomeLanding projects={projects ?? []} video={video} />
    </>
  );
}
