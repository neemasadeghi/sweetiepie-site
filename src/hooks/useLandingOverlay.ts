"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export const LANDING_REVEALED_EVENT = "landing:revealed";

/** True while the full-screen landing overlay is visible on `/`. */
export function useLandingOverlayActive(): boolean {
  const pathname = usePathname();
  const [overlayActive, setOverlayActive] = useState(pathname === "/");

  useEffect(() => {
    if (pathname !== "/") {
      setOverlayActive(false);
      return;
    }

    setOverlayActive(true);

    const onRevealed = () => setOverlayActive(false);
    window.addEventListener(LANDING_REVEALED_EVENT, onRevealed);
    return () => window.removeEventListener(LANDING_REVEALED_EVENT, onRevealed);
  }, [pathname]);

  return pathname === "/" && overlayActive;
}

export function notifyLandingRevealed() {
  window.dispatchEvent(new Event(LANDING_REVEALED_EVENT));
}
