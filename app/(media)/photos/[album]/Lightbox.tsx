"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { ShareMenu } from "@/components/recordings/ShareMenu";
import { useBodyScrollLock } from "@/components/shared/useBodyScrollLock";

interface LightboxProps {
  images: { src: string; alt: string }[];
  initialIndex: number;
  onClose: () => void;
  onIndexChange?: (index: number) => void;
  downloadLabel: string;
  closeLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
}

interface MobileBarrelIndicatorHandle {
  setDragPreview: (deltaX: number) => void;
  resetPreview: () => void;
  commitStep: (direction: "prev" | "next") => void;
}

interface MobileBarrelIndicatorProps {
  currentIndex: number;
  totalCount: number;
}

const MobileBarrelIndicator = forwardRef<MobileBarrelIndicatorHandle, MobileBarrelIndicatorProps>(
  function MobileBarrelIndicator({ currentIndex, totalCount }, ref) {
    const slots = 11;
    const half = Math.floor(slots / 2);
    const renderCount = slots + 6;
    const MAX_TRACK_WIDTH = 228;
    const VIEWPORT_GUTTER = 32;
    const [trackWidth, setTrackWidth] = useState(MAX_TRACK_WIDTH);
    const slotSpacing = 13;
    const currentCenterRef = useRef(currentIndex);
    const targetCenterRef = useRef(currentIndex);
    const isDraggingRef = useRef(false);
    const frameRef = useRef<number | null>(null);
    const stepReleaseTimerRef = useRef<number | null>(null);
    const pillRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const glowRef = useRef<HTMLSpanElement | null>(null);
    const STEP_HOLD_MS = 90;
    const STEP_CARRY = 0.92;
    const EDGE_SOFTNESS_PX = 34;

    const paint = useCallback(
      (center: number) => {
        const baseIndex = Math.floor(center) - half - 3;
        const halfTrack = trackWidth / 2;

        for (let i = 0; i < renderCount; i += 1) {
          const pill = pillRefs.current[i];
          if (pill) {
            const photoIndex = baseIndex + i;
            const delta = photoIndex - center;
            const distance = Math.abs(delta);
            const emphasis = Math.exp(-(distance * distance) * 0.72);
            const widthPx = 5.5 + emphasis * 6.5;
            const alpha = 0.14 + emphasis * 0.86;
            const yOffset = 0.2 + Math.min(2.2, distance * 0.6);
            const x = delta * slotSpacing;
            const distanceToEdge = halfTrack - (Math.abs(x) + widthPx / 2);
            const edgeFade = Math.max(0, Math.min(1, distanceToEdge / EDGE_SOFTNESS_PX));
            const isInRange = photoIndex >= 0 && photoIndex < totalCount;

            pill.style.left = `${halfTrack + x}px`;
            pill.style.width = `${widthPx}px`;
            pill.style.opacity = isInRange ? `${edgeFade}` : "0";
            pill.style.backgroundColor = `rgba(255,255,255,${alpha})`;
            pill.style.transform = `translate(-50%, calc(-50% + ${yOffset}px))`;
          }
        }

        const glow = glowRef.current;
        if (glow) {
          const motion = Math.min(1, Math.abs(targetCenterRef.current - center));
          glow.style.opacity = `${0.35 + motion * 0.2}`;
        }
      },
      [half, renderCount, slotSpacing, totalCount, trackWidth],
    );

    const stopLoop = useCallback(() => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      if (stepReleaseTimerRef.current) {
        window.clearTimeout(stepReleaseTimerRef.current);
        stepReleaseTimerRef.current = null;
      }
    }, []);

    const animate = useCallback(() => {
      frameRef.current = null;
      const { current } = currentCenterRef;
      const { current: target } = targetCenterRef;
      const next = current + (target - current) * 0.16;

      if (Math.abs(target - next) < 0.002) {
        currentCenterRef.current = target;
        paint(target);
        return;
      }

      currentCenterRef.current = next;
      paint(next);
      frameRef.current = window.requestAnimationFrame(animate);
    }, [paint]);

    const startLoop = useCallback(() => {
      if (frameRef.current) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    }, [animate]);

    useImperativeHandle(
      ref,
      () => ({
        setDragPreview: (deltaX: number) => {
          isDraggingRef.current = true;
          const clamped = Math.max(-96, Math.min(96, deltaX));
          targetCenterRef.current = currentIndex - (clamped / 96) * STEP_CARRY;
          startLoop();
        },
        resetPreview: () => {
          isDraggingRef.current = false;
          targetCenterRef.current = currentIndex;
          startLoop();
        },
        commitStep: (direction: "prev" | "next") => {
          isDraggingRef.current = false;
          if (stepReleaseTimerRef.current) {
            window.clearTimeout(stepReleaseTimerRef.current);
          }
          targetCenterRef.current =
            currentIndex + (direction === "next" ? STEP_CARRY : -STEP_CARRY);
          stepReleaseTimerRef.current = window.setTimeout(() => {
            targetCenterRef.current = currentIndex + (direction === "next" ? 1 : -1);
            startLoop();
            stepReleaseTimerRef.current = null;
          }, STEP_HOLD_MS);
          startLoop();
        },
      }),
      [STEP_CARRY, STEP_HOLD_MS, currentIndex, startLoop],
    );

    useEffect(() => {
      paint(currentCenterRef.current);
    }, [paint]);

    useEffect(() => {
      const updateTrackWidth = () => {
        const nextWidth = Math.min(MAX_TRACK_WIDTH, window.innerWidth - VIEWPORT_GUTTER);
        setTrackWidth((prev) => {
          const width = Math.max(156, nextWidth);
          return prev === width ? prev : width;
        });
      };

      updateTrackWidth();
      window.addEventListener("resize", updateTrackWidth);

      return () => {
        window.removeEventListener("resize", updateTrackWidth);
      };
    }, []);

    useEffect(() => {
      if (!isDraggingRef.current) {
        targetCenterRef.current = currentIndex;
        startLoop();
      }
    }, [currentIndex, startLoop]);

    useEffect(() => () => stopLoop(), [stopLoop]);

    const pillSlots = useMemo(
      () => Array.from({ length: renderCount }, (_, i) => i),
      [renderCount],
    );

    return (
      <div className="absolute inset-x-3 top-3 z-30 sm:hidden">
        <div
          className="relative mx-auto h-3 overflow-hidden"
          style={{
            width: `${trackWidth}px`,
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          <span
            ref={glowRef}
            className="pointer-events-none absolute top-1/2 left-1/2 h-2 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-sm"
            style={{ opacity: 0.55 }}
          />
          {pillSlots.map((slot) => (
            <span
              key={`progress-slot-${slot}`}
              ref={(node) => {
                pillRefs.current[slot] = node;
              }}
              className="absolute top-1/2 h-1 rounded-full"
              style={{ left: "50%", opacity: 0 }}
            />
          ))}
        </div>
      </div>
    );
  },
);

export function Lightbox({
  images,
  initialIndex,
  onClose,
  onIndexChange,
  downloadLabel,
  closeLabel = "Close",
  previousLabel = "Previous",
  nextLabel = "Next",
}: LightboxProps) {
  type NavigationSource = "tap" | "swipe" | "keyboard" | "desktop";
  const [index, setIndex] = useState(initialIndex);
  const [saveData, setSaveData] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  useBodyScrollLock(true, { preserveScroll: true });
  const isDesktopViewport = useCallback(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.matchMedia("(min-width: 640px)").matches;
  }, []);

  const updateIndex = useCallback(
    (newIndex: number) => {
      setIndex(newIndex);
      onIndexChange?.(newIndex);
    },
    [onIndexChange],
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const touchStartY = useRef(0);
  const dragYRef = useRef(0);
  const isMultiTouch = useRef(false);
  const exitAnimationRef = useRef<number | null>(null);
  const indicatorRef = useRef<MobileBarrelIndicatorHandle | null>(null);

  const DISMISS_DRAG_THRESHOLD = 100;

  const setPinching = useCallback((value: boolean) => {
    if (isMultiTouch.current === value) {
      return;
    }

    isMultiTouch.current = value;
    setIsPinching(value);
  }, []);

  const current = images[index];
  const hasPrev = index > 0;
  const hasNext = index < images.length - 1;
  const shareText = current?.alt ?? "";

  const goToPrev = useCallback(
    (_source: NavigationSource = "tap") => {
      if (!hasPrev) {
        return;
      }

      indicatorRef.current?.commitStep("prev");
      updateIndex(index - 1);
    },
    [hasPrev, index, updateIndex],
  );

  const goToNext = useCallback(
    (_source: NavigationSource = "tap") => {
      if (!hasNext) {
        return;
      }

      indicatorRef.current?.commitStep("next");
      updateIndex(index + 1);
    },
    [hasNext, index, updateIndex],
  );

  useEffect(() => {
    if (typeof navigator === "undefined") {
      return;
    }

    const { connection } = navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        addEventListener?: (type: string, listener: EventListener) => void;
        removeEventListener?: (type: string, listener: EventListener) => void;
      };
    };
    const update = () => setSaveData(Boolean(connection?.saveData));
    update();
    connection?.addEventListener?.("change", update);

    return () => connection?.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (saveData) {
      return;
    }

    const targets = [index - 1, index + 1].filter((i) => i >= 0 && i < images.length);
    targets.forEach((i) => {
      const img = new window.Image();
      img.src = images[i].src;
    });
  }, [index, images, saveData]);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, [index]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsEntering(false);
    }, 350);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowLeft") {
        goToPrev("keyboard");
      }

      if (e.key === "ArrowRight") {
        goToNext("keyboard");
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      if (exitAnimationRef.current) {
        window.clearTimeout(exitAnimationRef.current);
      }
    };
  }, [onClose, goToPrev, goToNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      setPinching(true);
      indicatorRef.current?.resetPreview();
      return;
    }

    setPinching(false);
    indicatorRef.current?.resetPreview();
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragYRef.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      setPinching(true);
      indicatorRef.current?.resetPreview();
      return;
    }

    if (isMultiTouch.current) {
      return;
    }

    touchEndX.current = e.touches[0].clientX;
    const deltaX = touchEndX.current - touchStartX.current;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (deltaY > 0) {
      if (absDeltaY >= absDeltaX) {
        indicatorRef.current?.resetPreview();
        setDragY(deltaY);
        dragYRef.current = deltaY;
        return;
      }
    }

    if (absDeltaX >= absDeltaY * 0.8) {
      indicatorRef.current?.setDragPreview(deltaX);
    } else {
      indicatorRef.current?.resetPreview();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMultiTouch.current) {
      if (e.touches.length === 0) {
        setPinching(false);
      }
      indicatorRef.current?.resetPreview();

      return;
    }

    const currentDragY = dragYRef.current;
    if (currentDragY > DISMISS_DRAG_THRESHOLD) {
      setIsExiting(true);
      indicatorRef.current?.resetPreview();
      const exitDistance = Math.max(currentDragY, window.innerHeight * 0.6);
      setDragY(exitDistance);
      dragYRef.current = exitDistance;

      if (exitAnimationRef.current) {
        window.clearTimeout(exitAnimationRef.current);
      }

      exitAnimationRef.current = window.setTimeout(() => {
        onClose();
      }, 250);

      return;
    }

    setDragY(0);
    dragYRef.current = 0;

    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold && hasNext) {
      goToNext("swipe");
    } else if (diff < -threshold && hasPrev) {
      goToPrev("swipe");
    } else {
      indicatorRef.current?.resetPreview();
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = current.src;
    a.download = current.src.split("/").pop() || "photo.jpg";
    a.target = "_blank";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const backdropOpacity = dragY > 0 ? Math.max(0, 0.95 - (dragY / 350) * 0.95) : undefined;
  const contentScale = dragY > 0 ? Math.max(0.8, 1 - (dragY / 500) * 0.2) : 1;

  return (
    <>
      <style>{`
        @keyframes lightboxEnter {
          0% {
            opacity: 0;
            transform: scale(0.92);
          }
          40% {
            opacity: 1;
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes lightboxBackdropEnter {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .lightbox-enter {
          animation: lightboxEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .lightbox-backdrop-enter {
          animation: lightboxBackdropEnter 0.25s ease-out forwards;
        }
      `}</style>
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 ${isEntering ? "lightbox-backdrop-enter" : ""}`}
        style={
          backdropOpacity !== undefined
            ? { backgroundColor: `rgba(0,0,0,${backdropOpacity})` }
            : undefined
        }
      >
        <MobileBarrelIndicator ref={indicatorRef} currentIndex={index} totalCount={images.length} />

        <div className="absolute top-8 right-3 left-3 z-30 flex items-center justify-between text-white sm:hidden">
          <button
            onClick={isExiting ? undefined : onClose}
            disabled={isExiting}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-50"
            aria-label={closeLabel}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="absolute left-1/2 flex h-9 min-w-[64px] -translate-x-1/2 items-center justify-center rounded-full bg-white/10 px-3 text-xs font-medium text-white/80 tabular-nums backdrop-blur-sm">
            {index + 1} / {images.length}
          </div>
          <div className="flex h-9 items-stretch overflow-hidden rounded-full bg-white/10 text-white/90 backdrop-blur-sm">
            <ShareMenu
              shareUrl={shareUrl}
              shareText={shareText}
              buttonClassName="h-full rounded-none px-3 text-white/90 hover:bg-white/20 hover:text-white"
              iconClassName="h-4 w-4"
              showLabel={false}
            />
            <div className="h-full w-px bg-white/20" />
            <button
              onClick={handleDownload}
              className="flex h-full cursor-pointer items-center justify-center px-3 text-white/90 transition-all hover:bg-white/20 hover:text-white"
              aria-label={downloadLabel}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          onClick={isExiting ? undefined : onClose}
          disabled={isExiting}
          className="absolute top-6 right-6 z-30 hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 disabled:opacity-50 sm:flex"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="absolute top-6 left-6 z-30 hidden sm:flex">
          <div className="flex h-12 items-stretch overflow-hidden rounded-full bg-white/10 text-white/90 backdrop-blur-sm">
            <ShareMenu
              shareUrl={shareUrl}
              shareText={shareText}
              buttonClassName="h-full rounded-none px-4 text-white/90 hover:bg-white/20 hover:text-white"
              iconClassName="h-5 w-5"
              showLabel={false}
            />
            <div className="h-full w-px bg-white/20" />
            <button
              onClick={handleDownload}
              className="flex h-full cursor-pointer items-center justify-center px-4 text-white/90 transition-all hover:bg-white/20 hover:text-white"
              aria-label={downloadLabel}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm sm:block">
          {index + 1} / {images.length}
        </div>

        {hasPrev && (
          <button
            onClick={() => goToPrev("desktop")}
            className="absolute left-6 z-30 hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
            aria-label={previousLabel}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {hasNext && (
          <button
            onClick={() => goToNext("desktop")}
            className="absolute right-6 z-30 hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
            aria-label="Next"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        <div
          className="relative flex h-full w-full items-center justify-center px-0 pt-0 pb-0 sm:px-16 sm:pt-24 sm:pb-16"
          style={{ touchAction: "pinch-zoom" }}
          onClick={(e) => {
            if (!isExiting && e.target === e.currentTarget) {
              onClose();
            }
          }}
          onTouchStart={isExiting ? undefined : handleTouchStart}
          onTouchMove={isExiting ? undefined : handleTouchMove}
          onTouchEnd={isExiting ? undefined : handleTouchEnd}
        >
          <img
            src={current.src}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 blur-lg sm:hidden"
          />
          <div className="absolute inset-0 bg-black/30 sm:hidden" />
          <div
            className={`relative z-20 flex items-center justify-center ${isEntering && !isExiting ? "lightbox-enter" : ""}`}
            style={{
              transform: dragY > 0 ? `translateY(${dragY}px) scale(${contentScale})` : undefined,
              transition:
                isExiting || dragY === 0 ? "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)" : "none",
            }}
          >
            <div
              className={`absolute inset-0 z-20 flex sm:hidden ${isPinching ? "pointer-events-none" : ""}`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev("tap");
                }}
                disabled={!hasPrev}
                aria-label={previousLabel}
                className="flex-1 disabled:opacity-0"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext("tap");
                }}
                disabled={!hasNext}
                aria-label={nextLabel}
                className="flex-1 disabled:opacity-0"
              />
            </div>
            <img
              src={current.src}
              alt={current.alt}
              className={`block max-h-[100svh] max-w-[100vw] object-contain sm:max-h-[calc(100vh-10rem)] sm:max-w-[calc(100vw-8rem)] sm:transition-transform sm:duration-200 ${
                isZoomed ? "sm:scale-150 sm:cursor-zoom-out" : "sm:cursor-zoom-in"
              }`}
              style={{ touchAction: "manipulation" }}
              onClick={(e) => {
                e.stopPropagation();

                if (isDesktopViewport()) {
                  setIsZoomed(!isZoomed);
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
