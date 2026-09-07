"use client";

import { useSyncExternalStore } from "react";

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
    () => false
  );
}
