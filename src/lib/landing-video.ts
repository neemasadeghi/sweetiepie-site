export type LandingVideo = {
  landscapePlaybackId: string;
  portraitPlaybackId: string;
};

export const emptyLandingVideo: LandingVideo = {
  landscapePlaybackId: "",
  portraitPlaybackId: "",
};

/** Optional local fallback if nothing is set in Studio (public/landing/). */
export const LANDING_VIDEO_FILES = {
  landscape: "/landing/hero-landscape.mp4",
  portrait: "/landing/hero-portrait.mp4",
} as const;
