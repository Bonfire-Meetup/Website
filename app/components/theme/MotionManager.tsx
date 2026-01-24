"use client";

import { useEffect } from "react";

export function MotionManager() {
  useEffect(() => {
    const root = document.documentElement;

    const update = () => {
      root.dataset.motion = document.visibilityState === "visible" ? "active" : "paused";
    };

    // Set initial state
    root.dataset.motion = "active";
    update();

    document.addEventListener("visibilitychange", update);
    window.addEventListener("pagehide", update);
    window.addEventListener("pageshow", update);

    return () => {
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pagehide", update);
      window.removeEventListener("pageshow", update);
    };
  }, []);

  return null;
}
