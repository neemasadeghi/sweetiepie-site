"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Project pages share the site layout, so window scroll can carry over from the grid. */
export function ProjectScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/project/")) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
