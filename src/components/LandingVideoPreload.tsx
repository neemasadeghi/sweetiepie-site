import type { LandingVideo } from "@/lib/landing-video";
import { getLandingPosterUrl } from "@/lib/landing-video";

export function LandingVideoPreload({ landing }: { landing: LandingVideo }) {
  const landscapeId = landing.landscapePlaybackId.trim();
  const portraitId = landing.portraitPlaybackId.trim();
  const landscapePoster = landscapeId
    ? getLandingPosterUrl(landscapeId)
    : "";
  const portraitPoster =
    portraitId && portraitId !== landscapeId
      ? getLandingPosterUrl(portraitId, { portrait: true })
      : "";

  if (!landscapePoster && !portraitPoster) return null;

  return (
    <>
      <link rel="preconnect" href="https://image.mux.com" />
      <link rel="preconnect" href="https://stream.mux.com" />
      <link rel="dns-prefetch" href="https://image.mux.com" />
      <link rel="dns-prefetch" href="https://stream.mux.com" />
      {landscapePoster ? (
        <link
          rel="preload"
          as="image"
          href={landscapePoster}
          fetchPriority="high"
        />
      ) : null}
      {portraitPoster ? (
        <link
          rel="preload"
          as="image"
          href={portraitPoster}
          media="(orientation: portrait)"
          fetchPriority="high"
        />
      ) : null}
    </>
  );
}
