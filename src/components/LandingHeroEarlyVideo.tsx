import {
  getLandingMp4Url,
  getLandingPosterUrl,
  getLandingStreamUrl,
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
  const landscapeHls = landscapeId ? getLandingStreamUrl(landscapeId) : "";
  const portraitHls =
    portraitId && portraitId !== landscapeId
      ? getLandingStreamUrl(portraitId)
      : "";
  const landscapeMp4 = landscapeId
    ? getLandingMp4Url(landscapeId)
    : LANDING_VIDEO_FILES.landscape;
  const portraitMp4 =
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

  if (!landscapeMp4 && !portraitMp4) return null;

  const posterProps = {
    alt: "",
    "aria-hidden": true,
    fetchPriority: "high" as const,
    decoding: "sync" as const,
    "data-landing-poster": true,
  };

  const renderVideo = (
    muxId: string,
    hlsSrc: string,
    mp4Fallback: string,
    orientationClass?: string
  ) => {
    const className = orientationClass
      ? `${styles.video} ${orientationClass}`
      : styles.video;

    if (muxId && hlsSrc) {
      return (
        <video
          className={className}
          src={hlsSrc}
          data-mux-playback-id={muxId}
          data-mp4-fallback={mp4Fallback}
          crossOrigin="anonymous"
          {...videoProps}
        />
      );
    }

    return (
      <video
        className={className}
        src={mp4Fallback}
        data-mp4-fallback={mp4Fallback}
        {...videoProps}
      />
    );
  };

  if (!portraitMp4 || landscapeMp4 === portraitMp4) {
    const poster = landscapePoster || portraitPoster;
    const muxId = landscapeId || portraitId;
    const hlsSrc = landscapeHls || portraitHls;
    const mp4 = landscapeMp4 || portraitMp4;

    return (
      <>
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} className={styles.poster} {...posterProps} />
        ) : null}
        {renderVideo(muxId, hlsSrc, mp4)}
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
      {renderVideo(
        landscapeId,
        landscapeHls,
        landscapeMp4,
        styles.videoLandscape
      )}
      {renderVideo(
        portraitId,
        portraitHls,
        portraitMp4,
        styles.videoPortrait
      )}
    </>
  );
}
