"use client";

import { useEffect, useRef, useState } from "react";

import { useNavigation } from "./NavigationContext";

export function NavigationLoader() {
  const { isNavigating } = useNavigation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const progressIntervalRef = useRef<number | null>(null);
  const wasNavigatingRef = useRef(false);

  useEffect(() => {
    if (isNavigating && !wasNavigatingRef.current) {
      wasNavigatingRef.current = true;
      setVisible(true);
      setProgress(15);

      let currentProgress = 15;
      progressIntervalRef.current = window.setInterval(() => {
        currentProgress += Math.random() * 20;
        if (currentProgress > 75) {
          currentProgress = 75;
        }
        setProgress(currentProgress);
      }, 120);
    } else if (!isNavigating && wasNavigatingRef.current) {
      wasNavigatingRef.current = false;

      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      setProgress(100);

      window.setTimeout(() => {
        setVisible(false);
        window.setTimeout(() => {
          setProgress(0);
        }, 300);
      }, 200);
    }

    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, [isNavigating]);

  if (!visible && progress === 0) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -100% 0;
          }
          100% {
            background-position: 100% 0;
          }
        }
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .loader-bar {
          background: linear-gradient(
            90deg,
            rgba(217, 70, 239, 0) 0%,
            #d946ef 50%,
            rgba(217, 70, 239, 0) 100%
          );
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }
        .loader-complete {
          animation: fadeOut 0.2s ease-out forwards;
        }
      `}</style>
      <div
        className={`fixed top-0 right-0 left-0 z-[9999] h-[2px] transition-opacity duration-200 ${!visible && progress === 100 ? "loader-complete" : visible ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className="loader-bar h-full transition-all duration-100 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </>
  );
}
