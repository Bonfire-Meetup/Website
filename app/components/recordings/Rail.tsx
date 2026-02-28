"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "../shared/Icons";
import { AccentBar } from "../ui/AccentBar";

import { buildRailGradientClasses, DEFAULT_RAIL_CONTAINER_CLASS } from "./rail-style-utils";

interface RailProps<T> {
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
  viewAllHref?: string;
  viewAllLabel?: string;
}

export function Rail<T>({
  title,
  items,
  renderItem,
  headerIcon,
  headerAccent,
  containerClassName = DEFAULT_RAIL_CONTAINER_CLASS,
  gradientFrom,
  gradientTo,
  scrollLeftLabel,
  scrollRightLabel,
  viewAllHref,
  viewAllLabel,
}: RailProps<T>) {
  const tCommon = useTranslations("common");
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const resolvedScrollLeftLabel = scrollLeftLabel ?? tCommon("scrollLeft");
  const resolvedScrollRightLabel = scrollRightLabel ?? tCommon("scrollRight");
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
  }, [items.length]);

  const scrollByAmount = (direction: number) => {
    if (!railRef.current) {
      return;
    }

    railRef.current.scrollBy({
      behavior: "smooth",
      left: direction * railRef.current.clientWidth * 0.85,
    });
  };

  if (items.length === 0) {
    return null;
  }

  const gradients = buildRailGradientClasses(gradientFrom, gradientTo, containerClassName);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {headerAccent || <AccentBar />}
          <h3 className="text-base font-semibold tracking-tight text-neutral-900 sm:text-lg dark:text-white">
            {title}
          </h3>
          {headerIcon}
        </div>
        <div className="flex items-center gap-2">
          {viewAllHref && viewAllLabel && (
            <Link
              href={viewAllHref}
              className="inline-flex h-8 items-center rounded-full border border-black/10 bg-white/75 px-3 text-[11px] font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-neutral-800 dark:hover:text-white"
            >
              {viewAllLabel}
            </Link>
          )}
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollByAmount(-1)}
              disabled={!canScrollLeft}
              aria-label={resolvedScrollLeftLabel}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm ring-1 transition ${
                canScrollLeft
                  ? "cursor-pointer bg-white text-neutral-700 ring-black/5 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:ring-white/10 dark:hover:bg-neutral-800"
                  : "cursor-not-allowed bg-neutral-100 text-neutral-400 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800"
              }`}
            >
              <ChevronLeftIcon className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount(1)}
              disabled={!canScrollRight}
              aria-label={resolvedScrollRightLabel}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full shadow-sm ring-1 transition ${
                canScrollRight
                  ? "cursor-pointer bg-white text-neutral-700 ring-black/5 hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:ring-white/10 dark:hover:bg-neutral-800"
                  : "cursor-not-allowed bg-neutral-100 text-neutral-400 ring-neutral-200 dark:bg-neutral-900 dark:text-neutral-600 dark:ring-neutral-800"
              }`}
            >
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
      <div className={`relative ${gradients.container}`}>
        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-visible scroll-smooth px-2 py-3"
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
