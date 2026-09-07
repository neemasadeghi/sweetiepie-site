import type { LandingVideo } from "@/lib/landing-video";
import { getLandingMp4Url, getLandingPosterUrl } from "@/lib/landing-video";

export function LandingVideoPreload({ landing }: { landing: LandingVideo }) {
  const landscapeId = landing.landscapePlaybackId.trim();
  const portraitId = landing.portraitPlaybackId.trim();
  const landscapePoster = landscapeId
    ? getLandingPosterUrl(landscapeId, { width: 2560, height: 1440 })
    : "";
  const portraitPoster =
    portraitId && portraitId !== landscapeId
      ? getLandingPosterUrl(portraitId, {
          portrait: true,
          width: 1440,
          height: 2560,
        })
      : "";
  const landscapeMp4 = landscapeId ? getLandingMp4Url(landscapeId) : "";
  const portraitMp4 =
    portraitId && portraitId !== landscapeId
      ? getLandingMp4Url(portraitId)
      : "";

  if (!landscapePoster && !portraitPoster && !landscapeMp4 && !portraitMp4) {
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
      {landscapeMp4 ? (
        <>
          <link
            rel="preload"
            as="fetch"
            href={landscapeMp4}
            crossOrigin="anonymous"
            fetchPriority="high"
          />
          <link
            rel="preload"
            as="video"
            href={landscapeMp4}
            type="video/mp4"
            crossOrigin="anonymous"
            fetchPriority="high"
          />
        </>
      ) : null}
      {portraitMp4 ? (
        <>
          <link
            rel="preload"
            as="fetch"
            href={portraitMp4}
            crossOrigin="anonymous"
            media="(orientation: portrait)"
            fetchPriority="high"
          />
          <link
            rel="preload"
            as="video"
            href={portraitMp4}
            type="video/mp4"
            crossOrigin="anonymous"
            media="(orientation: portrait)"
            fetchPriority="high"
          />
        </>
      ) : null}
    </>
  );
}
