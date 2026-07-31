"use client";

import { useEffect } from "react";
import { consumeWorkScrollRestore } from "@/lib/work-scroll";

/** Restores grid scroll after returning from a project page. */
export function WorkScrollRestore({ pathname }: { pathname: string }) {
  useEffect(() => {
    const y = consumeWorkScrollRestore(pathname);
    if (y == null) return;

    const restore = () => window.scrollTo({ top: y, left: 0, behavior: "instant" });

    // Wait for the grid to mount and lay out before restoring.
    requestAnimationFrame(() => requestAnimationFrame(restore));
  }, [pathname]);

  return null;
}
