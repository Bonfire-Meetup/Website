"use client";

import { useEffect, useRef, useReducer, useState } from "react";

type HeroSlideshowProps = {
  images: { src: string; alt: string }[];
  interval?: number;
};

type State = {
  ready: boolean;
  currentIndex: number;
  currentDirection: number;
  nextIndex: number | null;
  nextDirection: number;
  isTransitioning: boolean;
  prefersReducedMotion: boolean;
};

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
        ready: true,
        currentIndex: action.index,
        currentDirection: action.direction,
        prefersReducedMotion: action.reducedMotion,
      };
    case "START_TRANSITION":
      return {
        ...state,
        nextIndex: action.nextIndex,
        nextDirection: action.nextDirection,
        isTransitioning: true,
      };
    case "COMPLETE_TRANSITION":
      return {
        ...state,
        currentIndex: state.nextIndex ?? state.currentIndex,
        currentDirection: state.nextDirection,
        nextIndex: null,
        isTransitioning: false,
      };
    case "SET_REDUCED_MOTION":
      return { ...state, prefersReducedMotion: action.value };
    default:
      return state;
  }
}

export function HeroSlideshow({ images, interval = 10000 }: HeroSlideshowProps) {
  const [state, dispatch] = useReducer(reducer, {
    ready: false,
    currentIndex: 0,
    currentDirection: 1,
    nextIndex: null,
    nextDirection: 1,
    isTransitioning: false,
    prefersReducedMotion: false,
  });
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => new Set());

  const currentIndexRef = useRef(state.currentIndex);
  currentIndexRef.current = state.currentIndex;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const randomIndex = Math.floor(Math.random() * images.length);
    dispatch({
      type: "INIT",
      index: randomIndex,
      direction: getRandomDirection(),
      reducedMotion: mediaQuery.matches,
    });
    currentIndexRef.current = randomIndex;

    const handler = (event: MediaQueryListEvent) => {
      dispatch({ type: "SET_REDUCED_MOTION", value: event.matches });
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [images.length]);

  useEffect(() => {
    if (!state.ready || images.length <= 1 || state.prefersReducedMotion) return;

    const getNextRandomIndex = () => {
      let next = Math.floor(Math.random() * images.length);
      while (next === currentIndexRef.current && images.length > 1) {
        next = Math.floor(Math.random() * images.length);
      }
      return next;
    };

    const timer = setInterval(() => {
      const next = getNextRandomIndex();
      dispatch({ type: "START_TRANSITION", nextIndex: next, nextDirection: getRandomDirection() });

      setTimeout(() => {
        dispatch({ type: "COMPLETE_TRANSITION" });
      }, 2000);
    }, interval);

    return () => clearInterval(timer);
  }, [state.ready, images.length, interval, state.prefersReducedMotion]);

  if (images.length === 0) return null;

  if (!state.ready) {
    return <div className="absolute inset-0 bg-neutral-200 dark:bg-neutral-900" />;
  }

  const currentImage = images[state.currentIndex];
  const nextIndex = state.nextIndex;
  const nextImage = nextIndex !== null ? images[nextIndex] : null;
  const isCurrentLoaded = loadedIndices.has(state.currentIndex);

  const markLoaded = (index: number) => {
    setLoadedIndices((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  if (state.prefersReducedMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className="h-full w-full object-cover"
          onLoad={() => markLoaded(state.currentIndex)}
        />
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-200/80 via-white/70 to-neutral-200/60 transition-opacity duration-700 dark:from-neutral-900/80 dark:via-neutral-950/70 dark:to-neutral-900/60 ${
            isCurrentLoaded ? "opacity-0" : "opacity-100"
          }`}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-200/80 via-white/70 to-neutral-200/60 transition-opacity duration-700 dark:from-neutral-900/80 dark:via-neutral-950/70 dark:to-neutral-900/60 ${
          isCurrentLoaded ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        key={`slide-${state.currentIndex}`}
        className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
          state.isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        <img
          src={currentImage.src}
          alt={currentImage.alt}
          className={`h-full w-full object-cover hero-ken-burns-${state.currentDirection}`}
          onLoad={() => markLoaded(state.currentIndex)}
        />
      </div>

      {nextImage && (
        <div
          key={`slide-${state.nextIndex}`}
          className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${
            state.isTransitioning ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={nextImage.src}
            alt={nextImage.alt}
            className={`h-full w-full object-cover hero-ken-burns-${state.nextDirection}`}
            onLoad={() => markLoaded(nextIndex as number)}
          />
        </div>
      )}
    </div>
  );
}
