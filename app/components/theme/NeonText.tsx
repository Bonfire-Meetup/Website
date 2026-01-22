"use client";

import { type ReactNode, useEffect, useState } from "react";

export function NeonText({ children, className }: { children: ReactNode; className?: string }) {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let isMounted = true;

    const triggerGlitch = () => {
      if (!isMounted) {
        return;
      }

      const duration = Math.random() * 500 + 100;
      const endTime = Date.now() + duration;

      const flicker = () => {
        if (!isMounted) {
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
      const delay = Math.random() * 9000 + 3000;
      timeout = setTimeout(triggerGlitch, delay);
    };

    timeout = setTimeout(triggerGlitch, 2000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  return <span className={`${className} ${isActive ? "neon-active" : ""}`}>{children}</span>;
}
