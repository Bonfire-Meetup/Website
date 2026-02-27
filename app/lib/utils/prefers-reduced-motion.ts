"use client";

import { useEffect, useState } from "react";

export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function getPrefersReducedMotionMediaQuery(): MediaQueryList | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY);
}

export function prefersReducedMotion(): boolean {
  const mq = getPrefersReducedMotionMediaQuery();
  return mq?.matches ?? false;
}

export function usePrefersReducedMotion(): boolean {
  const [value, setValue] = useState(false);

  useEffect(() => {
    const mq = getPrefersReducedMotionMediaQuery();
    if (!mq) {
      return;
    }

    setValue(mq.matches);
    const handler = () => setValue(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return value;
}
