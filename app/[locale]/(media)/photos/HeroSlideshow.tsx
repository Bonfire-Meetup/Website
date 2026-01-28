"use client";

import Image from "next/image";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

interface HeroSlideshowProps {
  images: { src: string; alt: string }[];
  interval?: number;
}

interface State {
  ready: boolean;
  currentIndex: number;
  currentDirection: number;
  nextIndex: number | null;
  nextDirection: number;
  isTransitioning: boolean;
  prefersReducedMotion: boolean;
}

type Action =
  | { type: "START_TRANSITION"; nextIndex: number; nextDirection: number }
  | { type: "COMPLETE_TRANSITION" }
  | { type: "SET_REDUCED_MOTION"; value: boolean }
  | { type: "INIT"; index: number; direction: number; reducedMotion: boolean };

const getRandomDirection = () => Math.floor(Math.random() * 4) + 1;

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        currentDirection: action.direction,
        currentIndex: action.index,
        prefersReducedMotion: action.reducedMotion,
        ready: true,
      };

    case "START_TRANSITION":
      return {
        ...state,
        isTransitioning: true,
        nextDirection: action.nextDirection,
        nextIndex: action.nextIndex,
      };

    case "COMPLETE_TRANSITION":
      return {
        ...state,
        currentDirection: state.nextDirection,
        currentIndex: state.nextIndex ?? state.currentIndex,
        isTransitioning: false,
        nextIndex: null,
      };

    case "SET_REDUCED_MOTION":
      return { ...state, prefersReducedMotion: action.value };

    default:
      return state;
  }
}

export function HeroSlideshow({ images, interval = 10000 }: HeroSlideshowProps) {
  const [state, dispatch] = useReducer(reducer, {
    currentDirection: 1,
    currentIndex: 0,
    isTransitioning: false,
    nextDirection: 1,
    nextIndex: null,
    prefersReducedMotion: false,
    ready: false,
  });
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => new Set());
  const [isInView, setIsInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [saveData, setSaveData] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const transitionTimeoutRef = useRef<number | null>(null);
  const scheduleTimeoutRef = useRef<number | null>(null);
  const nextCandidateRef = useRef<number | null>(null);
  const nextDirectionRef = useRef<number>(1);
  const transitionDueRef = useRef(false);

  const currentIndexRef = useRef(state.currentIndex);
  currentIndexRef.current = state.currentIndex;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const randomIndex = Math.floor(Math.random() * images.length);
    dispatch({
      direction: getRandomDirection(),
      index: randomIndex,
      reducedMotion: mediaQuery.matches,
      type: "INIT",
    });
    currentIndexRef.current = randomIndex;

    const handler = (event: MediaQueryListEvent) => {
      dispatch({ type: "SET_REDUCED_MOTION", value: event.matches });
    };

    mediaQuery.addEventListener("change", handler);

    return () => mediaQuery.removeEventListener("change", handler);
  }, [images.length]);

  useEffect(() => {
    const handleVisibility = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };

    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting), {
      rootMargin: "200px",
    });
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

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

  const markLoaded = useCallback((index: number) => {
    setLoadedIndices((prev) => {
      if (prev.has(index)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(index);

      return next;
    });
  }, []);

  const preloadIndex = useCallback(
    (index: number) => {
      if (typeof window === "undefined") {
        return;
      }

      if (loadedIndices.has(index)) {
        return;
      }

      const img = new window.Image();
      img.src = images[index].src;
      img.onload = () => markLoaded(index);
    },
    [images, loadedIndices, markLoaded],
  );

  const currentImage = images[state.currentIndex];
  const { nextIndex } = state;
  const nextImage = nextIndex !== null ? images[nextIndex] : null;
  const isCurrentLoaded = loadedIndices.has(state.currentIndex);
  const getNextRandomIndex = useCallback(() => {
    let next = Math.floor(Math.random() * images.length);

    while (next === currentIndexRef.current && images.length > 1) {
      next = Math.floor(Math.random() * images.length);
    }

    return next;
  }, [images.length]);
  const startTransition = useCallback(
    (next: number, direction: number) => {
      if (state.isTransitioning) {
        return;
      }

      dispatch({ nextDirection: direction, nextIndex: next, type: "START_TRANSITION" });

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }

      transitionTimeoutRef.current = window.setTimeout(() => {
        dispatch({ type: "COMPLETE_TRANSITION" });
      }, 2000);
    },
    [state.isTransitioning],
  );
  const Loader = ({ hidden }: { hidden: boolean }) => (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center transition-opacity ${
        hidden ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-end gap-2">
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-500 shadow-[0_0_12px_var(--color-fire-mid-glow-45)] motion-reduce:animate-none dark:bg-orange-400" />
        <span className="h-3 w-3 animate-bounce rounded-full bg-orange-500 shadow-[0_0_14px_var(--color-fire-mid-glow-strong)] [animation-delay:150ms] motion-reduce:animate-none dark:bg-orange-400" />
        <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-orange-500 shadow-[0_0_12px_var(--color-fire-mid-glow-45)] [animation-delay:300ms] motion-reduce:animate-none dark:bg-orange-400" />
      </div>
    </div>
  );
  useEffect(() => {
    if (!state.ready || images.length <= 1 || state.prefersReducedMotion) {
      return;
    }

    if (!isInView || !isPageVisible) {
      return;
    }

    if (!loadedIndices.has(state.currentIndex)) {
      return;
    }

    if (state.isTransitioning) {
      return;
    }

    if (saveData) {
      return;
    }

    if (nextCandidateRef.current !== null) {
      return;
    }

    const next = getNextRandomIndex();
    nextCandidateRef.current = next;
    nextDirectionRef.current = getRandomDirection();

    if (!loadedIndices.has(next)) {
      preloadIndex(next);
    }
  }, [
    state.ready,
    images.length,
    state.prefersReducedMotion,
    isInView,
    isPageVisible,
    loadedIndices,
    state.currentIndex,
    state.isTransitioning,
    saveData,
    getNextRandomIndex,
    preloadIndex,
  ]);

  useEffect(() => {
    if (!state.ready || images.length <= 1 || state.prefersReducedMotion) {
      return;
    }

    if (!isInView || !isPageVisible) {
      return;
    }

    if (!loadedIndices.has(state.currentIndex)) {
      return;
    }

    if (state.isTransitioning) {
      return;
    }

    if (scheduleTimeoutRef.current) {
      clearTimeout(scheduleTimeoutRef.current);
    }

    scheduleTimeoutRef.current = window.setTimeout(() => {
      transitionDueRef.current = true;

      if (nextCandidateRef.current === null) {
        nextCandidateRef.current = getNextRandomIndex();
        nextDirectionRef.current = getRandomDirection();
      }

      const next = nextCandidateRef.current;

      if (next !== null && loadedIndices.has(next)) {
        transitionDueRef.current = false;
        nextCandidateRef.current = null;
        startTransition(next, nextDirectionRef.current);

        return;
      }

      if (next !== null) {
        preloadIndex(next);
      }
    }, interval);

    return () => {
      if (scheduleTimeoutRef.current) {
        clearTimeout(scheduleTimeoutRef.current);
      }
    };
  }, [
    state.ready,
    images.length,
    interval,
    state.prefersReducedMotion,
    isInView,
    isPageVisible,
    loadedIndices,
    state.currentIndex,
    state.isTransitioning,
    preloadIndex,
    startTransition,
    getNextRandomIndex,
  ]);

  useEffect(() => {
    if (!transitionDueRef.current) {
      return;
    }

    const next = nextCandidateRef.current;

    if (next === null) {
      return;
    }

    if (!loadedIndices.has(next)) {
      return;
    }

    if (state.prefersReducedMotion || !state.ready || !isInView || !isPageVisible) {
      return;
    }

    if (!loadedIndices.has(state.currentIndex)) {
      return;
    }

    if (state.isTransitioning) {
      return;
    }

    transitionDueRef.current = false;
    nextCandidateRef.current = null;
    startTransition(next, nextDirectionRef.current);
  }, [
    loadedIndices,
    state.prefersReducedMotion,
    state.ready,
    isInView,
    isPageVisible,
    state.currentIndex,
    state.isTransitioning,
    startTransition,
  ]);

  if (images.length === 0) {
    return null;
  }

  if (!state.ready) {
    return <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-900" />;
  }

  if (state.prefersReducedMotion) {
    return (
      <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          sizes="100vw"
          className={`object-cover transition-opacity duration-700 ${
            isCurrentLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => markLoaded(state.currentIndex)}
          priority
        />
        <Loader hidden={isCurrentLoaded} />
        <div
          className={`pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-neutral-200/80 via-white/70 to-neutral-200/60 transition-opacity duration-700 dark:from-neutral-900/80 dark:via-neutral-950/70 dark:to-neutral-900/60 ${
            isCurrentLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden">
      <div
        className={`pointer-events-none absolute inset-0 z-10 bg-gradient-to-br from-neutral-200/80 via-white/70 to-neutral-200/60 transition-opacity duration-700 dark:from-neutral-900/80 dark:via-neutral-950/70 dark:to-neutral-900/60 ${
          isCurrentLoaded ? "opacity-0" : "opacity-100"
        }`}
      />
      <Loader hidden={isCurrentLoaded} />
      <div
        key={`slide-${state.currentIndex}`}
        className={`absolute inset-0 z-0 transition-opacity duration-[2000ms] ease-in-out ${
          state.isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src={currentImage.src}
          alt={currentImage.alt}
          fill
          sizes="100vw"
          className={`object-cover hero-ken-burns-${state.currentDirection} transition-opacity duration-700 ${
            isCurrentLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => markLoaded(state.currentIndex)}
          priority
        />
      </div>

      {nextImage && (
        <div
          key={`slide-${state.nextIndex}`}
          className={`absolute inset-0 z-0 transition-opacity duration-[2000ms] ease-in-out ${
            state.isTransitioning ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={nextImage.src}
            alt={nextImage.alt}
            fill
            sizes="100vw"
            className={`object-cover hero-ken-burns-${state.nextDirection}`}
            onLoad={() => markLoaded(nextIndex as number)}
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}
