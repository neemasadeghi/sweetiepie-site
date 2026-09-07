"use client";

import { useLayoutEffect, useState } from "react";

function readPortrait(): boolean {
  return window.innerHeight >= window.innerWidth;
}

/** Portrait vs landscape — only updates on real device rotation, not Safari chrome resize. */
export function useStablePortraitOrientation(): boolean {
  const [isPortrait, setIsPortrait] = useState(false);

  useLayoutEffect(() => {
    setIsPortrait(readPortrait());

    const onOrientationChange = () => {
      requestAnimationFrame(() => setIsPortrait(readPortrait()));
    };

    window.addEventListener("orientationchange", onOrientationChange);
    return () =>
      window.removeEventListener("orientationchange", onOrientationChange);
  }, []);

  return isPortrait;
}
