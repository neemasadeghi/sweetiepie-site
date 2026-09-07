import Hls from "hls.js";
import { getLandingMp4Url, getLandingStreamUrl } from "./landing-video";

const QUALITY_RAMP_MS = 1200;

export type LandingPlaybackHandle = {
  play: () => void;
  destroy: () => void;
};

function playFromStart(video: HTMLVideoElement) {
  if (video.currentTime > 0.12) {
    video.currentTime = 0;
  }
  video.play().catch(() => {});
}

export function attachLandingPlayback(
  video: HTMLVideoElement
): LandingPlaybackHandle | null {
  const muxId = video.dataset.muxPlaybackId?.trim() ?? "";
  const mp4Fallback =
    video.dataset.mp4Fallback?.trim() || (muxId ? getLandingMp4Url(muxId) : "");

  if (!muxId) {
    if (!mp4Fallback) return null;
    video.src = mp4Fallback;
    return {
      play: () => playFromStart(video),
      destroy: () => {
        video.removeAttribute("src");
        video.load();
      },
    };
  }

  const streamUrl = getLandingStreamUrl(muxId);
  video.preload = "auto";
  video.currentTime = 0;

  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    if (!video.src) {
      video.src = streamUrl;
    }
    return {
      play: () => playFromStart(video),
      destroy: () => {
        video.removeAttribute("src");
        video.load();
      },
    };
  }

  video.removeAttribute("src");
  video.load();

  if (!Hls.isSupported()) {
    if (mp4Fallback) video.src = mp4Fallback;
    return {
      play: () => playFromStart(video),
      destroy: () => {
        video.removeAttribute("src");
        video.load();
      },
    };
  }

  const hls = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
    startLevel: 0,
    startFragPrefetch: true,
    maxBufferLength: 20,
    maxMaxBufferLength: 45,
    backBufferLength: 0,
  });

  let qualityRamped = false;

  hls.on(Hls.Events.MANIFEST_PARSED, () => {
    video.currentTime = 0;
    playFromStart(video);

    window.setTimeout(() => {
      if (qualityRamped || !hls.levels.length) return;
      qualityRamped = true;
      hls.currentLevel = -1;
    }, QUALITY_RAMP_MS);
  });

  hls.on(Hls.Events.ERROR, (_event, data) => {
    if (!data.fatal) return;
    hls.destroy();
    if (mp4Fallback) {
      video.src = mp4Fallback;
      playFromStart(video);
    }
  });

  hls.loadSource(streamUrl);
  hls.attachMedia(video);

  return {
    play: () => playFromStart(video),
    destroy: () => {
      hls.destroy();
    },
  };
}
