"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../shared/icons";
import { AccentBar } from "../ui/AccentBar";

type RailProps<T> = {
  title: string;
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  headerIcon?: ReactNode;
  headerAccent?: ReactNode;
  containerClassName?: string;
  gradientFrom?: string;
  gradientTo?: string;
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
};

export function Rail<T>({
  title,
  items,
  renderItem,
  headerIcon,
  headerAccent,
  containerClassName = "rounded-[28px] bg-white/60 px-2 pt-2 pb-2 dark:bg-neutral-950/60",
  gradientFrom,
  gradientTo,
  scrollLeftLabel = "Scroll left",
  scrollRightLabel = "Scroll right",
}: RailProps<T>) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    if (!railRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = railRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    updateScrollState();
    rail.addEventListener("scroll", updateScrollState);

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [items.length]);

  const scrollByAmount = (direction: number) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({
      left: direction * railRef.current.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  if (items.length === 0) return null;

  const getGradientClasses = () => {
    if (!gradientFrom || !gradientTo) {
      return {
        container: containerClassName,
        left: null as string | null,
        right: null as string | null,
      };
    }
    const isRose = gradientFrom.includes("rose");
    const isEmerald = gradientFrom.includes("emerald");
    const ringClass = isRose
      ? "ring-rose-500/10 dark:ring-rose-400/20"
      : isEmerald
        ? "ring-emerald-500/10 dark:ring-emerald-400/20"
        : "";
    const leftGradient = isRose
      ? "from-rose-500/5 to-transparent dark:from-rose-500/10"
      : isEmerald
        ? "from-emerald-500/5 to-transparent dark:from-emerald-500/10"
        : null;
    const rightGradient = gradientTo.includes("orange")
      ? "from-orange-500/5 to-transparent dark:from-orange-500/10"
      : gradientTo.includes("teal")
        ? "from-teal-500/5 to-transparent dark:from-teal-500/10"
        : null;
    return {
      container: `relative ${containerClassName} bg-gradient-to-r ${gradientFrom} ${gradientTo} ring-1 ${ringClass}`,
      left: leftGradient,
      right: rightGradient,
    };
  };

  const gradients = getGradientClasses();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {headerAccent || <AccentBar />}
          <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
            {title}
          </h3>
          {headerIcon}
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            disabled={!canScrollLeft}
            aria-label={scrollLeftLabel}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full shadow-sm ring-1 transition ${
              canScrollLeft
                ? "bg-white text-neutral-700 ring-black/5 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:ring-white/10 dark:hover:bg-neutral-800 cursor-pointer"
                : "bg-neutral-100 text-neutral-400 ring-neutral-200 cursor-not-allowed dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800"
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
                ? "bg-white text-neutral-700 ring-black/5 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:ring-white/10 dark:hover:bg-neutral-800 cursor-pointer"
                : "bg-neutral-100 text-neutral-400 ring-neutral-200 cursor-not-allowed dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800"
            }`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className={gradients.container}>
        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth"
        >
          {items.map((item, index) => renderItem(item, index))}
        </div>
        {gradients.left && (
          <div
            className={`pointer-events-none absolute inset-y-0 left-0 w-10 rounded-[28px] bg-gradient-to-r ${gradients.left}`}
          />
        )}
        {gradients.right && (
          <div
            className={`pointer-events-none absolute inset-y-0 right-0 w-10 rounded-[28px] bg-gradient-to-l ${gradients.right}`}
          />
        )}
      </div>
    </div>
  );
}
