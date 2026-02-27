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
    const burstTimers: ReturnType<typeof setTimeout>[] = [];
    let isMounted = true;

    const runInitialBurst = () => {
      const sequence: { on: boolean; wait: number }[] = [
        { on: true, wait: 80 },
        { on: false, wait: 90 },
        { on: true, wait: 70 },
        { on: false, wait: 85 },
        { on: true, wait: 120 },
      ];

      let elapsed = 0;
      const scheduled = sequence.map((step) => {
        elapsed += step.wait;
        return { delay: elapsed, on: step.on };
      });

      scheduled.forEach(({ delay, on: shouldBeOn }) => {
        burstTimers.push(
          setTimeout(() => {
            if (isMounted && isPageVisible) {
              setIsActive(shouldBeOn);
            }
          }, delay),
        );
      });
    };

    const triggerGlitch = () => {
      if (!isMounted || !isPageVisible) {
        return;
      }

      const duration = Math.random() * 900 + 260;
      const endTime = Date.now() + duration;

      const flicker = () => {
        if (!isMounted || !isPageVisible) {
          return;
        }

        if (Date.now() < endTime) {
          setIsActive(Math.random() > 0.42);
          timeout = setTimeout(flicker, Math.random() * 45 + 22);
        } else {
          const stayOn = Math.random() > 0.58;
          setIsActive(stayOn);

          if (stayOn) {
            timeout = setTimeout(
              () => {
                if (isMounted && isPageVisible) {
                  setIsActive(false);
                  timeout = setTimeout(triggerGlitch, Math.random() * 5200 + 1700);
                }
              },
              Math.random() * 1300 + 450,
            );
          } else {
            timeout = setTimeout(triggerGlitch, Math.random() * 5000 + 1400);
          }
        }
      };

      flicker();
    };

    runInitialBurst();
    timeout = setTimeout(triggerGlitch, 520);

    return () => {
      isMounted = false;
      for (const timer of burstTimers) {
        clearTimeout(timer);
      }
      clearTimeout(timeout);
    };
  }, [isPageVisible]);

  return <span className={`${className} ${isActive ? "neon-active" : ""}`}>{children}</span>;
}
