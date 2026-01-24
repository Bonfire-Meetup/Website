"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import type { RootState } from "@/lib/redux/store";
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

import { CloseIcon } from "./icons";

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

export function GlobalPlayerProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("recordings");
  const dispatch = useAppDispatch();
  const player = useAppSelector((state) => state.player) as RootState["player"];
  const video = player.video as VideoInfo | null;
  const [inlineElement, setInlineElement] = useState<HTMLDivElement | null>(null);
  const {cinemaMode} = player;
  const playerRect = player.playerRect as Rect | null;
  const {isAnimating} = player;
  const {isLoading} = player;
  const {hasPlaybackStarted} = player;
  const lastInlineRectRef = useRef<Rect | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const canMiniPlayer = useMediaQuery("(min-width: 768px)");
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const isInline = Boolean(inlineElement);

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
      if (!iframeRef.current?.contentWindow) {
        return;
      }

      if (event.source !== iframeRef.current.contentWindow) {
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

      if (!parsed) {
        return;
      }

      const eventName = parsed.event;

      if (!eventName) {
        return;
      }

      const { info } = parsed;
      const playerState =
        typeof info === "number"
          ? info
          : typeof info === "object" && info && "playerState" in info
            ? (info as { playerState?: number }).playerState
            : undefined;

      if (eventName === "onStateChange" || eventName === "infoDelivery") {
        if (playerState === 1 || playerState === 2 || playerState === 3) {
          dispatch(setHasPlaybackStarted(true));
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, [video, dispatch]);

  const registerPlayerListener = () => {
    const target = iframeRef.current?.contentWindow;

    if (!target) {
      return;
    }

    target.postMessage(JSON.stringify({ event: "listening", id: "global-player" }), "*");
    target.postMessage(
      JSON.stringify({
        args: ["onStateChange"],
        event: "command",
        func: "addEventListener",
      }),
      "*",
    );
  };

  const value = useMemo(
    () => ({
      cinemaMode,
      clearVideo: () => dispatch(clearVideoAction()),
      setCinemaMode: (value: boolean) => dispatch(setCinemaModeAction(value)),
      setInlineContainer: (element: HTMLDivElement | null) => {
        setInlineElement(element);
        dispatch(setInlineContainerAction(element?.id ?? null));
      },
      setVideo: (next: VideoInfo) => {
        const hasCurrentVideo = Boolean(video);
        const isSameYoutubeId = video?.youtubeId === next.youtubeId;
        const isSameWatchUrl = video?.watchUrl === next.watchUrl;
        const isSameVideo = hasCurrentVideo && isSameYoutubeId && isSameWatchUrl;

        if (isSameVideo) {
          return;
        }

        dispatch(setVideoAction(next));
      },
    }),
    [cinemaMode, dispatch, video],
  );

  const isNotInline = !isInline;
  const isNotCinemaMode = !cinemaMode;
  const showMiniControls = isNotInline && isNotCinemaMode && canMiniPlayer && playerRect;

  const isMiniPlayerEnabled = ENABLE_GLOBAL_MINI_PLAYER;
  const hasVideo = Boolean(video);
  const hasPlayerRect = Boolean(playerRect);
  const canShowPlayer = isInline || canMiniPlayer;
  const shouldShowPlayer = isMiniPlayerEnabled && hasVideo && hasPlayerRect && canShowPlayer;

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

          {showMiniControls && (
            <div
              className="fixed right-6 z-[60] flex items-center gap-2"
              style={{ bottom: `${24 + MINI_HEIGHT + 8}px` }}
            >
              <Link
                href={video.watchUrl}
                className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold tracking-[0.2em] text-neutral-700 uppercase shadow-lg ring-1 ring-black/5 transition dark:bg-neutral-950/90 dark:text-neutral-200 dark:ring-white/10"
              >
                {t("returnToPlayer")}
              </Link>
              <button
                type="button"
                onClick={() => dispatch(clearVideoAction())}
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-black/70 text-white/80 shadow-lg transition hover:bg-black/90 hover:text-white"
                aria-label={t("closePlayer")}
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          )}

          <div
            className={`fixed overflow-hidden bg-black ${cinemaMode
                ? "z-[80] rounded-2xl"
                : isInline
                  ? "z-40 rounded-xl"
                  : "z-50 rounded-2xl shadow-2xl ring-1 ring-black/20"
              } ${isAnimating ? "transition-all duration-300" : ""}`}
            style={{
              height: playerRect.height,
              left: playerRect.left,
              top: playerRect.top,
              width: playerRect.width,
            }}
          >
            {isLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              </div>
            )}
            {/* eslint-disable-next-line react/iframe-missing-sandbox */}
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&enablejsapi=1${origin ? `&origin=${encodeURIComponent(origin)}` : ""}`}
              title={video.title}
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
