"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CloseIcon } from "./icons";

export const ENABLE_GLOBAL_MINI_PLAYER = true;

type VideoInfo = {
  youtubeId: string;
  title: string;
  watchUrl: string;
};

type InlineRect = {
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

export function GlobalPlayerProvider({ children }: { children: React.ReactNode }) {
  const [video, setVideo] = useState<VideoInfo | null>(null);
  const [inlineElement, setInlineElement] = useState<HTMLDivElement | null>(null);
  const [inlineRect, setInlineRect] = useState<InlineRect | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [miniHeight, setMiniHeight] = useState(0);
  const [cinemaMode, setCinemaMode] = useState(false);
  const miniRef = useRef<HTMLDivElement | null>(null);
  const canMiniPlayer = useMediaQuery("(min-width: 768px)");

  const updateRect = useCallback(() => {
    if (!inlineElement) {
      setInlineRect(null);
      return;
    }
    const rect = inlineElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      setInlineRect(null);
      return;
    }
    setInlineRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, [inlineElement]);

  useEffect(() => {
    if (!inlineElement) {
      setInlineRect(null);
      return;
    }
    updateRect();
    const observer = new ResizeObserver(() => updateRect());
    observer.observe(inlineElement);
    const handleScroll = () => requestAnimationFrame(updateRect);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateRect);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateRect);
    };
  }, [inlineElement, updateRect]);

  useEffect(() => {
    if (!video) return;
    setIsLoading(true);
  }, [video?.youtubeId]);

  useEffect(() => {
    if (!video || inlineRect || !miniRef.current) {
      setMiniHeight(0);
      return;
    }
    const update = () => {
      const rect = miniRef.current?.getBoundingClientRect();
      if (rect) {
        setMiniHeight(rect.height);
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(miniRef.current);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [video, inlineRect]);

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

  const isInline = Boolean(inlineRect);

  return (
    <GlobalPlayerContext.Provider value={value}>
      {children}
      {ENABLE_GLOBAL_MINI_PLAYER && video && (
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
                className="fixed right-6 top-6 z-[90] inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
                aria-label="Exit theater"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </>
          )}
          {!isInline && !cinemaMode && canMiniPlayer ? (
            <div
              className="fixed right-6 z-[60] flex items-center gap-2"
              style={{ bottom: `${24 + miniHeight + 8}px` }}
            >
              <Link
                href={video.watchUrl}
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-700 shadow-lg ring-1 ring-black/5 transition dark:bg-neutral-950/90 dark:text-neutral-200 dark:ring-white/10"
              >
                Return to player
              </Link>
              <button
                type="button"
                onClick={() => setVideo(null)}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white/80 shadow-lg transition cursor-pointer hover:bg-black/90 hover:text-white"
                aria-label="Close player"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          ) : null}
          {(cinemaMode || isInline || canMiniPlayer) && (
            <div
              ref={miniRef}
              className={`fixed overflow-hidden bg-black transition-all duration-300 ${
                cinemaMode
                  ? "z-[80] aspect-video w-[92vw] max-w-[1200px] rounded-2xl"
                  : isInline
                    ? "z-40 rounded-xl"
                    : "bottom-6 right-6 z-50 aspect-video w-[220px] rounded-2xl shadow-2xl ring-1 ring-black/20 sm:w-[260px] md:w-[320px]"
              }`}
              style={
                cinemaMode
                  ? {
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                    }
                  : isInline
                    ? {
                        top: inlineRect?.top ?? 0,
                        left: inlineRect?.left ?? 0,
                        width: inlineRect?.width ?? 0,
                        height: inlineRect?.height ?? 0,
                      }
                    : undefined
              }
            >
              {isLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                  <div className="h-12 w-12 animate-spin rounded-full border-2 border-white/40 border-t-white" />
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
          )}
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
