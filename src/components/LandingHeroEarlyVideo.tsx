import {
  getLandingMp4Url,
  getLandingPosterUrl,
  LANDING_VIDEO_FILES,
} from "@/lib/landing-video";
import styles from "./LandingHero.module.css";

type LandingHeroEarlyVideoProps = {
  landscapePlaybackId: string;
  portraitPlaybackId: string;
};

export function LandingHeroEarlyVideo({
  landscapePlaybackId,
  portraitPlaybackId,
}: LandingHeroEarlyVideoProps) {
  const landscapeId = landscapePlaybackId.trim();
  const portraitId = portraitPlaybackId.trim() || landscapeId;
  const landscapeSrc = landscapeId
    ? getLandingMp4Url(landscapeId)
    : LANDING_VIDEO_FILES.landscape;
  const portraitSrc =
    portraitId && portraitId !== landscapeId
      ? getLandingMp4Url(portraitId)
      : landscapeId
        ? ""
        : LANDING_VIDEO_FILES.portrait;
  const landscapePoster = landscapeId
    ? getLandingPosterUrl(landscapeId)
    : "";
  const portraitPoster =
    portraitId && portraitId !== landscapeId
      ? getLandingPosterUrl(portraitId, { portrait: true })
      : "";

  const videoProps = {
    autoPlay: true,
    muted: true,
    loop: true,
    playsInline: true,
    preload: "auto" as const,
    tabIndex: -1,
    suppressHydrationWarning: true,
  };

  if (!landscapeSrc && !portraitSrc) return null;

  const posterProps = {
    alt: "",
    "aria-hidden": true,
    fetchPriority: "high" as const,
    decoding: "async" as const,
    "data-landing-poster": true,
  };

  if (!portraitSrc || landscapeSrc === portraitSrc) {
    const poster = landscapePoster || portraitPoster;
    return (
      <>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={poster}
            className={styles.poster}
            {...posterProps}
          />
        ) : null}
        <video
          className={styles.video}
          src={landscapeSrc || portraitSrc}
          crossOrigin={landscapeId || portraitId ? "anonymous" : undefined}
          {...videoProps}
        />
      </>
    );
  }

  return (
    <>
      {landscapePoster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={landscapePoster}
          className={`${styles.poster} ${styles.posterLandscape}`}
          {...posterProps}
        />
      ) : null}
      {portraitPoster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={portraitPoster}
          className={`${styles.poster} ${styles.posterPortrait}`}
          {...posterProps}
        />
      ) : null}
      <video
        className={`${styles.video} ${styles.videoLandscape}`}
        src={landscapeSrc}
        crossOrigin={landscapeId ? "anonymous" : undefined}
        {...videoProps}
      />
      <video
        className={`${styles.video} ${styles.videoPortrait}`}
        src={portraitSrc}
        crossOrigin={portraitId ? "anonymous" : undefined}
        {...videoProps}
      />
    </>
  );
}
