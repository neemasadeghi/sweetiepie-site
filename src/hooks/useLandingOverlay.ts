"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const LANDING_REVEALED_EVENT = "landing:revealed";
const LANDING_DISMISSED_KEY = "landing-dismissed";

let initialPathHandled = false;

function shouldShowLandingOnFreshLoad(): boolean {
  if (typeof window === "undefined") return true;

  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;

  if (nav?.type === "reload") {
    sessionStorage.removeItem(LANDING_DISMISSED_KEY);
    return true;
  }

  return sessionStorage.getItem(LANDING_DISMISSED_KEY) !== "1";
}

function markLandingDismissed() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LANDING_DISMISSED_KEY, "1");
}

function ensureInitialPathHandled(pathname: string) {
  if (initialPathHandled) return;
  initialPathHandled = true;

  if (pathname !== "/") {
    markLandingDismissed();
    return;
  }

  if (!shouldShowLandingOnFreshLoad()) {
    markLandingDismissed();
  }
}

function shouldShowLandingNow(pathname: string): boolean {
  if (typeof window === "undefined") {
    return pathname === "/";
  }

  ensureInitialPathHandled(pathname);

  if (pathname !== "/") return false;
  return sessionStorage.getItem(LANDING_DISMISSED_KEY) !== "1";
}

/** True while the full-screen landing overlay is visible on `/`. */
export function useLandingOverlayActive(): boolean {
  const pathname = usePathname();
  const [overlayActive, setOverlayActive] = useState(() =>
    shouldShowLandingNow(pathname)
  );

  useEffect(() => {
    setOverlayActive(shouldShowLandingNow(pathname));

    if (pathname !== "/") return;

    const onRevealed = () => {
      markLandingDismissed();
      setOverlayActive(false);
    };

    window.addEventListener(LANDING_REVEALED_EVENT, onRevealed);
    return () => window.removeEventListener(LANDING_REVEALED_EVENT, onRevealed);
  }, [pathname]);

  return overlayActive;
}

export function notifyLandingRevealed() {
  markLandingDismissed();
  window.dispatchEvent(new Event(LANDING_REVEALED_EVENT));
}
