"use client";

import { type ReactNode, useEffect, useState } from "react";

export function NeonText({ children, className }: { children: ReactNode; className?: string }) {
  const [isActive, setIsActive] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };

    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (!isPageVisible) {
      setIsActive(false);
      return;
    }

    let timeout: ReturnType<typeof setTimeout>;
    let isMounted = true;

    const triggerGlitch = () => {
      if (!isMounted || !isPageVisible) {
        return;
      }

      const duration = Math.random() * 500 + 100;
      const endTime = Date.now() + duration;

      const flicker = () => {
        if (!isMounted || !isPageVisible) {
          return;
        }

        if (Date.now() < endTime) {
          setIsActive(Math.random() > 0.5);
          timeout = setTimeout(flicker, Math.random() * 50 + 30);
        } else {
          const stayOn = Math.random() > 0.8;
          setIsActive(stayOn);

          if (stayOn) {
            timeout = setTimeout(
              () => {
                if (isMounted && isPageVisible) {
                  setIsActive(false);
                  timeout = setTimeout(triggerGlitch, Math.random() * 9000 + 3000);
                }
              },
              Math.random() * 2000 + 1000,
            );
          } else {
            timeout = setTimeout(triggerGlitch, Math.random() * 9000 + 3000);
          }
        }
      };

      flicker();
    };

    timeout = setTimeout(triggerGlitch, 500);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [isPageVisible]);

  return <span className={`${className} ${isActive ? "neon-active" : ""}`}>{children}</span>;
}
