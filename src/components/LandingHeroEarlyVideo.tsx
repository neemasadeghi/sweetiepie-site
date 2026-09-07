import {
  getLandingMp4Url,
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

  if (!portraitSrc || landscapeSrc === portraitSrc) {
    return (
      <video
        className={styles.video}
        src={landscapeSrc || portraitSrc}
        crossOrigin={landscapeId || portraitId ? "anonymous" : undefined}
        {...videoProps}
      />
    );
  }

  return (
    <>
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
