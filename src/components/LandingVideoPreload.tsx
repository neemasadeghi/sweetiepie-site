import type { LandingVideo } from "@/lib/landing-video";
import { getLandingStreamUrl } from "@/lib/landing-video";

export function LandingVideoPreload({ landing }: { landing: LandingVideo }) {
  const landscapeId = landing.landscapePlaybackId.trim();
  const portraitId = landing.portraitPlaybackId.trim();
  const landscapeStream = landscapeId ? getLandingStreamUrl(landscapeId) : "";
  const portraitStream =
    portraitId && portraitId !== landscapeId
      ? getLandingStreamUrl(portraitId)
      : "";

  if (!landscapeStream && !portraitStream) {
    return null;
  }

  return (
    <>
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
