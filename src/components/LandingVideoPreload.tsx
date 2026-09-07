import type { LandingVideo } from "@/lib/landing-video";
import { getLandingMp4Url } from "@/lib/landing-video";

export function LandingVideoPreload({ landing }: { landing: LandingVideo }) {
  const landscapeId = landing.landscapePlaybackId.trim();
  const portraitId = landing.portraitPlaybackId.trim();
  const landscapeMp4 = landscapeId ? getLandingMp4Url(landscapeId) : "";
  const portraitMp4 =
    portraitId && portraitId !== landscapeId
      ? getLandingMp4Url(portraitId)
      : "";

  if (!landscapeMp4 && !portraitMp4) {
    return null;
  }

  return (
    <>
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
