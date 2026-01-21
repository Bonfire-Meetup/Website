"use client";

import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon } from "./icons";

export const ENABLE_GLOBAL_MINI_PLAYER = true;

type VideoInfo = {
  youtubeId: string;
  title: string;
  watchUrl: string;
};

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type GlobalPlayerContextValue = {
  setVideo: (video: VideoInfo) => void;
  setInlineContainer: (element: HTMLDivElement | null) => void;
  clearVideo: () => void;
  cinemaMode: boolean;
  setCinemaMode: (value: boolean) => void;
};

const GlobalPlayerContext = createContext<GlobalPlayerContextValue | null>(null);

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);
    handleChange();
    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }
    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, [query]);

  return matches;
};

const MINI_WIDTH = 320;
const MINI_HEIGHT = (MINI_WIDTH * 9) / 16;

export function GlobalPlayerProvider({
  children,
  labels,
}: {
  children: React.ReactNode;
  labels: { returnToPlayer: string; closePlayer: string; exitCinema: string };
}) {
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [inlineElement, setInlineElement] = useState<HTMLDivElement | null>(null);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [playerRect, setPlayerRect] = useState<Rect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const lastInlineRectRef = useRef<Rect | null>(null);
  const canMiniPlayer = useMediaQuery("(min-width: 768px)");

  const isInline = Boolean(inlineElement);

  useEffect(() => {
    setIsLoading(true);
  }, [video?.youtubeId]);

  useEffect(() => {
    if (!inlineElement) return;
    const updateRect = () => {
      const rect = inlineElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const newRect = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
        lastInlineRectRef.current = newRect;
        if (!cinemaMode) {
          setPlayerRect(newRect);
        }
      }
    };
    updateRect();
    const observer = new ResizeObserver(updateRect);
    observer.observe(inlineElement);
    window.addEventListener("scroll", updateRect, { passive: true });
    window.addEventListener("resize", updateRect);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateRect);
      window.removeEventListener("resize", updateRect);
    };
  }, [inlineElement, cinemaMode]);

  useEffect(() => {
    if (cinemaMode) {
      const vw = window.innerWidth;
      const width = Math.min(vw * 0.92, 1200);
      const height = (width * 9) / 16;
      setPlayerRect({
        top: (window.innerHeight - height) / 2,
        left: (vw - width) / 2,
        width,
        height,
      });
      return;
    }

    if (isInline) return;

    if (!canMiniPlayer || !video) {
      setPlayerRect(null);
      return;
    }

    const miniRect = {
      top: window.innerHeight - 24 - MINI_HEIGHT,
      left: window.innerWidth - 24 - MINI_WIDTH,
      width: MINI_WIDTH,
      height: MINI_HEIGHT,
    };

    if (lastInlineRectRef.current) {
      setPlayerRect(lastInlineRectRef.current);
      setIsAnimating(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPlayerRect(miniRect);
          setTimeout(() => setIsAnimating(false), 300);
        });
      });
      lastInlineRectRef.current = null;
    } else {
      setPlayerRect(miniRect);
    }
  }, [isInline, canMiniPlayer, video, cinemaMode]);

  useEffect(() => {
    if (isInline || isAnimating || cinemaMode) return;
    const update = () => {
      setPlayerRect({
        top: window.innerHeight - 24 - MINI_HEIGHT,
        left: window.innerWidth - 24 - MINI_WIDTH,
        width: MINI_WIDTH,
        height: MINI_HEIGHT,
      });
    };
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isInline, isAnimating, cinemaMode]);

  const value = useMemo(
    () => ({
      setVideo: (next: VideoInfo) =>
        setVideo((current) => {
          if (
            current &&
            current.youtubeId === next.youtubeId &&
            current.watchUrl === next.watchUrl
          ) {
            return current;
          }
          return next;
        }),
      setInlineContainer: setInlineElement,
      clearVideo: () => setVideo(null),
      cinemaMode,
      setCinemaMode,
    }),
    [cinemaMode],
  );

  const showMiniControls = !isInline && !cinemaMode && canMiniPlayer && playerRect;

  return (
    <GlobalPlayerContext.Provider value={value}>
      {children}
      {ENABLE_GLOBAL_MINI_PLAYER && video && playerRect && (
        <>
          {cinemaMode && (
            <>
              <div
                className="fixed inset-0 z-[70] bg-black/95"
                onClick={() => setCinemaMode(false)}
              />
              <button
                type="button"
                onClick={() => setCinemaMode(false)}
                className="fixed right-6 top-6 z-[90] inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
                aria-label={labels.exitCinema}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </>
          )}

          {showMiniControls && (
            <div
              className="fixed right-6 z-[60] flex items-center gap-2"
              style={{ bottom: `${24 + MINI_HEIGHT + 8}px` }}
            >
              <Link
                href={video.watchUrl}
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-700 shadow-lg ring-1 ring-black/5 transition dark:bg-neutral-950/90 dark:text-neutral-200 dark:ring-white/10"
              >
                {labels.returnToPlayer}
              </Link>
              <button
                type="button"
                onClick={() => setVideo(null)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white/80 shadow-lg transition cursor-pointer hover:bg-black/90 hover:text-white"
                aria-label={labels.closePlayer}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          <div
            className={`fixed overflow-hidden bg-black ${
              cinemaMode
                ? "z-[80] rounded-2xl"
                : isInline
                  ? "z-40 rounded-xl"
                  : "z-50 rounded-2xl shadow-2xl ring-1 ring-black/20"
            } ${isAnimating ? "transition-all duration-300" : ""}`}
            style={{
              top: playerRect.top,
              left: playerRect.left,
              width: playerRect.width,
              height: playerRect.height,
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            )}
            <iframe
              src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              className={`absolute inset-0 h-full w-full ${cinemaMode ? "rounded-2xl" : ""}`}
            />
          </div>
        </>
      )}
    </GlobalPlayerContext.Provider>
  );
}

export function useGlobalPlayer() {
  const context = useContext(GlobalPlayerContext);
  if (!context) {
    throw new Error("useGlobalPlayer must be used within GlobalPlayerProvider");
  }
  return context;
}
