"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  cb();
  return () => {};
}

function getSnapshot() {
  const video = document.createElement("video");
  return (
    video.canPlayType("application/vnd.apple.mpegurl") !== "" ||
    video.canPlayType("application/x-mpegURL") !== ""
  );
}

/** Safari plays Mux HLS natively — much faster startup than Mux Player on mobile. */
export function useNativeHlsSupported(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

const MOBILE_MQ = "(max-width: 768px), (pointer: coarse)";

function subscribeMobile(cb: () => void) {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

function getMobileSnapshot() {
  return window.matchMedia(MOBILE_MQ).matches;
}

export function useIsMobileLanding(): boolean {
  return useSyncExternalStore(
    subscribeMobile,
    getMobileSnapshot,
    () => true
  );
}
