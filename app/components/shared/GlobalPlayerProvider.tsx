"use client";

import type { RootState } from "@/lib/redux/store";
import { useTranslations } from "next-intl";
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

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  clearVideo as clearVideoAction,
  setCinemaMode as setCinemaModeAction,
  setHasPlaybackStarted,
  setInlineContainer as setInlineContainerAction,
  setIsAnimating,
  setIsLoading,
  setPlayerRect,
  setVideo as setVideoAction,
} from "@/lib/redux/slices/playerSlice";

import { CloseIcon } from "./Icons";

export const ENABLE_GLOBAL_MINI_PLAYER = true;

interface VideoInfo {
  youtubeId: string;
  title: string;
  watchUrl: string;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface GlobalPlayerContextValue {
  setVideo: (video: VideoInfo) => void;
  setInlineContainer: (element: HTMLDivElement | null) => void;
  clearVideo: () => void;
  cinemaMode: boolean;
  setCinemaMode: (value: boolean) => void;
}

type Corner = "top-left" | "top-right" | "bottom-left" | "bottom-right";

const INFO_BAR_HEIGHT = 48;
const MIN_VIDEO_WIDTH = 280;
const MAX_VIDEO_WIDTH = 1120;
const MINI_WIDTH = 320;
const MINI_HEIGHT = (MINI_WIDTH * 9) / 16;
const EDGE_MARGIN = 16;

const GlobalPlayerContext = createContext<GlobalPlayerContextValue | null>(null);

const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handleChange = () => setMatches(media.matches);
    handleChange();

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
};

const useWindowSize = () => {
  const [size, setSize] = useState({ height: 0, width: 0 });

  useEffect(() => {
    const update = () => setSize({ height: window.innerHeight, width: window.innerWidth });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return size;
};

export function GlobalPlayerProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("recordings");
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player) as RootState["player"];
  const video = player.video as VideoInfo | null;
  const [inlineElement, setInlineElement] = useState<HTMLDivElement | null>(null);
  const { cinemaMode, isAnimating, isLoading, hasPlaybackStarted } = player;
  const playerRect = player.playerRect as Rect | null;
  const lastInlineRectRef = useRef<Rect | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const canMiniPlayer = useMediaQuery("(min-width: 768px)");
  const windowSize = useWindowSize();
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const isInline = Boolean(inlineElement);
  const showMiniPlayer = !isInline && !cinemaMode && canMiniPlayer && Boolean(playerRect);
  const shouldShowPlayer =
    ENABLE_GLOBAL_MINI_PLAYER &&
    Boolean(video) &&
    Boolean(playerRect) &&
    (isInline || canMiniPlayer);

  const [corner, setCorner] = useState<Corner>("bottom-right");
  const [miniSize, setMiniSize] = useState<number>(MINI_WIDTH);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; startX: number; startY: number } | null>(
    null,
  );
  const resizeStartRef = useRef<{ width: number; mouseX: number } | null>(null);

  const miniVideoWidth = miniSize;
  const miniVideoHeight = (miniSize * 9) / 16;
  const miniWrapperWidth = miniVideoWidth;
  const miniWrapperHeight = miniVideoHeight + INFO_BAR_HEIGHT;

  const getCornerPosition = useCallback(
    (c: Corner, wrapperW: number, wrapperH: number) => {
      const positions = {
        "bottom-left": { x: EDGE_MARGIN, y: windowSize.height - EDGE_MARGIN - wrapperH },
        "bottom-right": {
          x: windowSize.width - EDGE_MARGIN - wrapperW,
          y: windowSize.height - EDGE_MARGIN - wrapperH,
        },
        "top-left": { x: EDGE_MARGIN, y: EDGE_MARGIN },
        "top-right": { x: windowSize.width - EDGE_MARGIN - wrapperW, y: EDGE_MARGIN },
      };
      return positions[c];
    },
    [windowSize.width, windowSize.height],
  );

  const getNearestCorner = useCallback(
    (x: number, y: number, wrapperW: number, wrapperH: number): Corner => {
      const centerX = x + wrapperW / 2;
      const centerY = y + wrapperH / 2;
      const isLeft = centerX < windowSize.width / 2;
      const isTop = centerY < windowSize.height / 2;
      if (isTop && isLeft) {
        return "top-left";
      }
      if (isTop && !isLeft) {
        return "top-right";
      }
      if (!isTop && isLeft) {
        return "bottom-left";
      }
      return "bottom-right";
    },
    [windowSize.width, windowSize.height],
  );

  const currentPosition =
    dragPosition ?? getCornerPosition(corner, miniWrapperWidth, miniWrapperHeight);

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const pos = getCornerPosition(corner, miniWrapperWidth, miniWrapperHeight);
      dragStartRef.current = { startX: pos.x, startY: pos.y, x: e.clientX, y: e.clientY };
      setDragPosition(pos);
      setIsDragging(true);
    },
    [corner, miniWrapperWidth, miniWrapperHeight, getCornerPosition],
  );

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      resizeStartRef.current = { mouseX: e.clientX, width: miniSize };
      setIsResizing(true);
    },
    [miniSize],
  );

  useEffect(() => {
    dispatch(setIsLoading(true));
    dispatch(setHasPlaybackStarted(false));
  }, [video?.youtubeId, dispatch]);

  useEffect(() => {
    if (!inlineElement) {
      return;
    }

    const updateRect = () => {
      const rect = inlineElement.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const newRect = { height: rect.height, left: rect.left, top: rect.top, width: rect.width };
        lastInlineRectRef.current = newRect;
        if (!cinemaMode) {
          dispatch(setPlayerRect(newRect));
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
  }, [inlineElement, cinemaMode, dispatch]);

  useEffect(() => {
    if (cinemaMode) {
      const vw = window.innerWidth;
      const width = Math.min(vw * 0.92, 1200);
      const height = (width * 9) / 16;
      dispatch(
        setPlayerRect({
          height,
          left: (vw - width) / 2,
          top: (window.innerHeight - height) / 2,
          width,
        }),
      );
      return;
    }

    if (isInline) {
      return;
    }

    if (!canMiniPlayer || !video || !hasPlaybackStarted) {
      dispatch(setPlayerRect(null));
      return;
    }

    const miniRect = {
      height: MINI_HEIGHT,
      left: window.innerWidth - 24 - MINI_WIDTH,
      top: window.innerHeight - 24 - MINI_HEIGHT,
      width: MINI_WIDTH,
    };

    if (lastInlineRectRef.current) {
      dispatch(setPlayerRect(lastInlineRectRef.current));
      dispatch(setIsAnimating(true));
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          dispatch(setPlayerRect(miniRect));
          setTimeout(() => dispatch(setIsAnimating(false)), 300);
        });
      });
      lastInlineRectRef.current = null;
    } else {
      dispatch(setPlayerRect(miniRect));
    }
  }, [isInline, canMiniPlayer, video, cinemaMode, hasPlaybackStarted, dispatch]);

  useEffect(() => {
    if (isInline || isAnimating || cinemaMode || !canMiniPlayer || !hasPlaybackStarted) {
      return;
    }

    const update = () => {
      dispatch(
        setPlayerRect({
          height: MINI_HEIGHT,
          left: window.innerWidth - 24 - MINI_WIDTH,
          top: window.innerHeight - 24 - MINI_HEIGHT,
          width: MINI_WIDTH,
        }),
      );
    };

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [isInline, isAnimating, cinemaMode, canMiniPlayer, hasPlaybackStarted, dispatch]);

  useEffect(() => {
    if (!video) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      if (!iframeRef.current?.contentWindow || event.source !== iframeRef.current.contentWindow) {
        return;
      }
      if (!event.origin.includes("youtube")) {
        return;
      }
      if (typeof event.data !== "string" && typeof event.data !== "object") {
        return;
      }

      const parsed =
        typeof event.data === "string"
          ? (() => {
              try {
                return JSON.parse(event.data) as { event?: string; info?: unknown };
              } catch {
                return null;
              }
            })()
          : (event.data as { event?: string; info?: unknown });

      if (!parsed?.event) {
        return;
      }

      const { info } = parsed;
      const playerState =
        typeof info === "number"
          ? info
          : typeof info === "object" && info && "playerState" in info
            ? (info as { playerState?: number }).playerState
            : undefined;

      if (
        (parsed.event === "onStateChange" || parsed.event === "infoDelivery") &&
        (playerState === 1 || playerState === 2 || playerState === 3)
      ) {
        dispatch(setHasPlaybackStarted(true));
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [video, dispatch]);

  useEffect(() => {
    if (!isDragging && !isResizing) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      if (isDragging && dragStartRef.current) {
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        const newX = Math.max(
          0,
          Math.min(windowSize.width - miniWrapperWidth, dragStartRef.current.startX + dx),
        );
        const newY = Math.max(
          0,
          Math.min(windowSize.height - miniWrapperHeight, dragStartRef.current.startY + dy),
        );
        setDragPosition({ x: newX, y: newY });
      }
      if (isResizing && resizeStartRef.current) {
        const dx = e.clientX - resizeStartRef.current.mouseX;
        const resizeDir = corner.includes("right") ? -dx : dx;
        setMiniSize(
          Math.max(
            MIN_VIDEO_WIDTH,
            Math.min(MAX_VIDEO_WIDTH, resizeStartRef.current.width + resizeDir),
          ),
        );
      }
    };

    const handleMouseUp = () => {
      if (isDragging && dragPosition) {
        setCorner(
          getNearestCorner(dragPosition.x, dragPosition.y, miniWrapperWidth, miniWrapperHeight),
        );
      }
      setIsDragging(false);
      setIsResizing(false);
      setDragPosition(null);
      dragStartRef.current = null;
      resizeStartRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove, { capture: true });
    document.addEventListener("mouseup", handleMouseUp, { capture: true });
    return () => {
      document.removeEventListener("mousemove", handleMouseMove, { capture: true });
      document.removeEventListener("mouseup", handleMouseUp, { capture: true });
    };
  }, [
    isDragging,
    isResizing,
    corner,
    dragPosition,
    miniWrapperWidth,
    miniWrapperHeight,
    windowSize.width,
    windowSize.height,
    getNearestCorner,
  ]);

  const registerPlayerListener = () => {
    const target = iframeRef.current?.contentWindow;
    if (!target) {
      return;
    }
    target.postMessage(JSON.stringify({ event: "listening", id: "global-player" }), "*");
    target.postMessage(
      JSON.stringify({ args: ["onStateChange"], event: "command", func: "addEventListener" }),
      "*",
    );
  };

  const value = useMemo(
    () => ({
      cinemaMode,
      clearVideo: () => dispatch(clearVideoAction()),
      setCinemaMode: (v: boolean) => dispatch(setCinemaModeAction(v)),
      setInlineContainer: (element: HTMLDivElement | null) => {
        setInlineElement(element);
        dispatch(setInlineContainerAction(element?.id ?? null));
      },
      setVideo: (next: VideoInfo) => {
        if (video?.youtubeId === next.youtubeId && video?.watchUrl === next.watchUrl) {
          return;
        }
        dispatch(setVideoAction(next));
      },
    }),
    [cinemaMode, dispatch, video],
  );

  return (
    <GlobalPlayerContext.Provider value={value}>
      {children}
      {shouldShowPlayer && video && playerRect && (
        <>
          {cinemaMode && (
            <>
              <div
                className="fixed inset-0 z-[70] bg-black/95"
                onClick={() => dispatch(setCinemaModeAction(false))}
              />
              <button
                type="button"
                onClick={() => dispatch(setCinemaModeAction(false))}
                className="fixed top-6 right-6 z-[90] inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
                aria-label={t("exitCinema")}
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </>
          )}

          {showMiniPlayer && (
            <div
              className={`fixed z-40 overflow-hidden rounded-xl bg-white/80 shadow-[0_4px_24px_rgba(0,0,0,0.15)] ring-1 ring-black/5 backdrop-blur-xl dark:bg-neutral-900/80 dark:shadow-[0_4px_24px_rgba(0,0,0,0.5)] dark:ring-white/10 ${isDragging || isResizing ? "" : "transition-all duration-300 ease-out"}`}
              style={{
                height: miniWrapperHeight,
                left: currentPosition.x,
                top: currentPosition.y,
                width: miniWrapperWidth,
              }}
            >
              <div
                className="absolute right-0 bottom-0 left-0 flex cursor-move items-center gap-3 border-t border-black/5 bg-white/50 px-3 backdrop-blur-md dark:border-white/5 dark:bg-neutral-800/50"
                style={{ height: INFO_BAR_HEIGHT }}
                onMouseDown={handleDragStart}
              >
                <div className="flex items-end gap-0.5">
                  <span
                    className="w-0.5 animate-[bounce_0.6s_ease-in-out_infinite] rounded-full bg-red-500"
                    style={{ height: 12 }}
                  />
                  <span
                    className="w-0.5 animate-[bounce_0.6s_ease-in-out_0.15s_infinite] rounded-full bg-red-500"
                    style={{ height: 16 }}
                  />
                  <span
                    className="w-0.5 animate-[bounce_0.6s_ease-in-out_0.3s_infinite] rounded-full bg-red-500"
                    style={{ height: 10 }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                    {video.title}
                  </p>
                </div>
                <Link
                  href={video.watchUrl}
                  className="flex-shrink-0 rounded-full p-1.5 text-neutral-500 transition-colors hover:bg-black/5 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  title={t("returnToPlayer")}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              </div>
            </div>
          )}

          <div
            className={`fixed overflow-hidden bg-black ${showMiniPlayer ? "z-50 rounded-t-xl" : cinemaMode ? "z-[80] rounded-2xl shadow-2xl" : "z-40 rounded-xl"} ${!showMiniPlayer && isAnimating ? "transition-all duration-300" : ""} ${showMiniPlayer && !isDragging && !isResizing ? "transition-all duration-300 ease-out" : ""}`}
            style={
              showMiniPlayer
                ? {
                    height: miniVideoHeight,
                    left: currentPosition.x,
                    top: currentPosition.y,
                    width: miniVideoWidth,
                  }
                : {
                    height: playerRect.height,
                    left: playerRect.left,
                    top: playerRect.top,
                    width: playerRect.width,
                  }
            }
          >
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0&modestbranding=1&enablejsapi=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`}
              title={video.title}
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-presentation allow-popups allow-popups-to-escape-sandbox"
              onLoad={() => {
                dispatch(setIsLoading(false));
                registerPlayerListener();
              }}
              className={`absolute inset-0 h-full w-full ${cinemaMode ? "rounded-2xl" : ""}`}
            />
          </div>

          {showMiniPlayer && (
            <div
              className={`pointer-events-none fixed z-60 ${isDragging || isResizing ? "" : "transition-all duration-300 ease-out"}`}
              style={{
                height: miniVideoHeight,
                left: currentPosition.x,
                top: currentPosition.y,
                width: miniVideoWidth,
              }}
            >
              {(isDragging || isResizing) && (
                <div className="pointer-events-auto absolute inset-0" />
              )}
              <button
                type="button"
                onClick={() => dispatch(clearVideoAction())}
                className="pointer-events-auto absolute top-2 right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-black/80 hover:text-white active:scale-95"
                aria-label={t("closePlayer")}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
              <div
                className={`pointer-events-auto absolute top-0 w-3 cursor-ew-resize ${corner.includes("right") ? "left-0" : "right-0"}`}
                style={{ height: miniWrapperHeight }}
                onMouseDown={handleResizeStart}
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
