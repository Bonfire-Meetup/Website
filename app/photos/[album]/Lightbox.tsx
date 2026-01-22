"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  const [index, setIndex] = useState(initialIndex);
  const [saveData, setSaveData] = useState(false);
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
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isMultiTouch = useRef(false);

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

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      updateIndex(index - 1);
    }
  }, [hasPrev, index, updateIndex]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      updateIndex(index + 1);
    }
  }, [hasNext, index, updateIndex]);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowLeft") {
        goToPrev();
      }

      if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const { scrollY } = window;
    const originalStyle = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalStyle.overflow;
      document.body.style.position = originalStyle.position;
      document.body.style.top = originalStyle.top;
      document.body.style.width = originalStyle.width;
      window.scrollTo(0, scrollY);
    };
  }, [onClose, goToPrev, goToNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setPinching(e.touches.length > 1);
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 1) {
      setPinching(true);
    }

    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isMultiTouch.current) {
      if (e.touches.length === 0) {
        setPinching(false);
      }

      return;
    }

    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (diff > threshold && hasNext) {
      goToNext();
    } else if (diff < -threshold && hasPrev) {
      goToPrev();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
      <div className="absolute inset-x-3 top-3 z-30 flex gap-1 sm:hidden">
        {images.map((_, i) => (
          <div
            key={`progress-${i}`}
            className={`h-1 flex-1 rounded-full ${i <= index ? "bg-white" : "bg-white/30"}`}
          />
        ))}
      </div>

      <div className="absolute top-8 right-3 left-3 z-30 flex items-center justify-between text-white sm:hidden">
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
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
        <div className="flex h-9 items-center justify-center rounded-full bg-white/10 px-3 text-xs font-medium text-white/80 backdrop-blur-sm">
          {index + 1} / {images.length}
        </div>
        <button
          onClick={handleDownload}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm transition-colors hover:bg-white/20"
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

      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-30 hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20 sm:flex"
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

      <div className="absolute top-6 left-6 z-30 hidden gap-2 sm:flex">
        <button
          onClick={handleDownload}
          className="flex h-12 cursor-pointer items-center gap-2 rounded-full bg-white/10 px-5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
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
          {downloadLabel}
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm sm:block">
        {index + 1} / {images.length}
      </div>

      {hasPrev && (
        <button
          onClick={goToPrev}
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
          onClick={goToNext}
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
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={current.src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-70 blur-lg sm:hidden"
        />
        <div className="absolute inset-0 bg-black/30 sm:hidden" />
        <div className="relative z-20 inline-flex max-h-[100svh] max-w-[100vw] items-center justify-center sm:max-h-full sm:max-w-full">
          <div
            className={`absolute inset-0 z-20 flex sm:hidden ${isPinching ? "pointer-events-none" : ""}`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToPrev();
              }}
              disabled={!hasPrev}
              aria-label={previousLabel}
              className="flex-1 disabled:opacity-0"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              disabled={!hasNext}
              aria-label={nextLabel}
              className="flex-1 disabled:opacity-0"
            />
          </div>
          <img
            src={current.src}
            alt={current.alt}
            className={`block max-h-[100svh] max-w-[100vw] object-contain sm:max-h-full sm:max-w-full sm:transition-transform sm:duration-200 ${
              isZoomed ? "sm:scale-150 sm:cursor-zoom-out" : "sm:cursor-zoom-in"
            }`}
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
  );
}
