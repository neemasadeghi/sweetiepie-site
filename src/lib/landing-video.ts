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

/** Full-quality progressive MP4 (faststart) — primary landing playback. */
export function getLandingMp4Url(playbackId: string): string {
  const id = playbackId.trim();
  if (!id) return "";
  return `https://stream.mux.com/${id}/highest.mp4`;
}

/** HLS stream — fast adaptive start, ramps to full quality. */
export function getLandingStreamUrl(playbackId: string): string {
  const id = playbackId.trim();
  if (!id) return "";
  return `https://stream.mux.com/${id}.m3u8`;
}

/** First-frame still from Mux — shown instantly while the stream buffers. */
export function getLandingPosterUrl(
  playbackId: string,
  options: { portrait?: boolean; width?: number; height?: number } = {}
): string {
  const id = playbackId.trim();
  if (!id) return "";
  const portrait = options.portrait ?? false;
  const width = options.width ?? (portrait ? 1440 : 2560);
  const height = options.height ?? (portrait ? 2560 : 1440);
  return `https://image.mux.com/${id}/thumbnail.jpg?width=${width}&height=${height}&fit_mode=smartcrop&time=0`;
}
