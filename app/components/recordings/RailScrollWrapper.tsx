"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "../shared/icons";

interface RailScrollWrapperProps {
  children: ReactNode;
  headerContent: ReactNode;
  itemCount: number;
  containerClassName?: string;
  gradientLeft?: string | null;
  gradientRight?: string | null;
  scrollLeftLabel: string;
  scrollRightLabel: string;
}

export function RailScrollWrapper({
  children,
  headerContent,
  itemCount,
  containerClassName = "rounded-[28px] bg-white/60 px-2 pt-2 pb-2 dark:bg-neutral-950/60",
  gradientLeft,
  gradientRight,
  scrollLeftLabel,
  scrollRightLabel,
}: RailScrollWrapperProps) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    if (!railRef.current) {
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) {
      return;
    }

    updateScrollState();
    rail.addEventListener("scroll", updateScrollState);

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [itemCount]);

  const scrollByAmount = (direction: number) => {
    if (!railRef.current) {
      return;
    }

    railRef.current.scrollBy({
      behavior: "smooth",
      left: direction * railRef.current.clientWidth * 0.85,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {headerContent}
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label={scrollLeftLabel}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm ring-1 transition ${
              canScrollLeft
                ? "cursor-pointer bg-white text-neutral-700 ring-black/5 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:ring-white/10 dark:hover:bg-neutral-800"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800"
            }`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            disabled={!canScrollRight}
            aria-label={scrollRightLabel}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm ring-1 transition ${
              canScrollRight
                ? "cursor-pointer bg-white text-neutral-700 ring-black/5 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:ring-white/10 dark:hover:bg-neutral-800"
                : "cursor-not-allowed bg-neutral-100 text-neutral-400 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800"
            }`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className={containerClassName}>
        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pt-1 pb-4"
        >
          {children}
        </div>
        {gradientLeft && (
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-10 rounded-[28px] bg-gradient-to-r ${gradientLeft}`}
          />
        )}
        {gradientRight && (
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-10 rounded-[28px] bg-gradient-to-l ${gradientRight}`}
          />
        )}
      </div>
    </div>
  );
}
