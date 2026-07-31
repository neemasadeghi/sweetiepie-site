"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { consumeWorkScrollRestore, isProjectPathname } from "@/lib/work-scroll";
import { isWorkPathname } from "@/lib/work-paths";

function scrollToY(y: number) {
  window.scrollTo({ top: y, left: 0, behavior: "auto" });
}

/** Retry while the grid finishes layout (images, framer-motion, etc.). */
function restoreScrollWithRetries(y: number) {
  scrollToY(y);
  const delays = [0, 16, 50, 100, 200, 400, 700];
  const timers = delays.map((ms) => window.setTimeout(() => scrollToY(y), ms));
  return () => timers.forEach(clearTimeout);
}

/**
 * Keeps scroll behavior consistent across every work tab and project page:
 * - opening any /project/* route → top of page
 * - returning to any work tab → restore saved grid scroll
 */
export function SiteScrollManager() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (isProjectPathname(pathname)) {
      scrollToY(0);
      return;
    }

    if (isWorkPathname(pathname)) {
      const y = consumeWorkScrollRestore(pathname);
      if (y != null) {
        return restoreScrollWithRetries(y);
      }
    }
  }, [pathname]);

  return null;
}
