"use client";

import { useEffect, useState, type ReactNode } from "react";

export function NeonText({ children, className }: { children: ReactNode; className?: string }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isMounted = true;

    const triggerGlitch = () => {
      if (!isMounted) return;

      // Random duration for the glitch sequence (100ms to 600ms)
      const duration = Math.random() * 500 + 100;
      const endTime = Date.now() + duration;

      const flicker = () => {
        if (!isMounted) return;

        if (Date.now() < endTime) {
          setIsActive(Math.random() > 0.5);
          // Rapid flickering (30ms to 80ms)
          timeout = setTimeout(flicker, Math.random() * 50 + 30);
        } else {
          // End state: Small chance to stay ON for a bit, otherwise OFF
          const stayOn = Math.random() > 0.8;
          setIsActive(stayOn);

          if (stayOn) {
            // If staying ON, hold it for a while (1s - 3s)
            timeout = setTimeout(
              () => {
                if (isMounted) {
                  setIsActive(false);
                  scheduleNextGlitch();
                }
              },
              Math.random() * 2000 + 1000,
            );
          } else {
            scheduleNextGlitch();
          }
        }
      };

      flicker();
    };

    const scheduleNextGlitch = () => {
      // Random delay between glitch bursts (3s to 12s)
      const delay = Math.random() * 9000 + 3000;
      timeout = setTimeout(triggerGlitch, delay);
    };

    // Start with a small delay
    timeout = setTimeout(triggerGlitch, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  return <span className={`${className} ${isActive ? "neon-active" : ""}`}>{children}</span>;
}
