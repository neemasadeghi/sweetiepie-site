import type { LandingVideo } from "@/lib/landing-video";
import {
  getLandingPosterUrl,
  getLandingStreamUrl,
} from "@/lib/landing-video";

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
  const landscapeStream = landscapeId ? getLandingStreamUrl(landscapeId) : "";
  const portraitStream =
    portraitId && portraitId !== landscapeId
      ? getLandingStreamUrl(portraitId)
      : "";

  if (!landscapePoster && !portraitPoster && !landscapeStream && !portraitStream) {
    return null;
  }

  return (
    <>
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
      {landscapeStream ? (
        <link
          rel="preload"
          as="fetch"
          href={landscapeStream}
          crossOrigin="anonymous"
          fetchPriority="high"
        />
      ) : null}
      {portraitStream ? (
        <link
          rel="preload"
          as="fetch"
          href={portraitStream}
          crossOrigin="anonymous"
          media="(orientation: portrait)"
          fetchPriority="high"
        />
      ) : null}
    </>
  );
}
