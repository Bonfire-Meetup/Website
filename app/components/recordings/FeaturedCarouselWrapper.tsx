"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { FEATURED_INTERVAL_MS, type CatalogRecording } from "./RecordingsCatalogTypes";

interface FeaturedCarouselWrapperProps {
  candidates: CatalogRecording[];
  candidateContents: ReactNode[];
  imageElements: ReactNode;
  hasFeaturedHero: boolean;
  previousLabel: string;
  nextLabel: string;
}

export function FeaturedCarouselWrapper({
  candidates,
  candidateContents,
  imageElements,
  hasFeaturedHero,
  previousLabel,
  nextLabel,
}: FeaturedCarouselWrapperProps) {
  const router = useRouter();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const [canHover, setCanHover] = useState(false);
  const featuredStartRef = useRef(0);
  const featuredRemainingRef = useRef(FEATURED_INTERVAL_MS);

  useEffect(() => {
    const container = imageContainerRef.current;
    if (!container) {
      return;
    }

    const images = container.querySelectorAll(".featured-carousel-image");
    images.forEach((img, index) => {
      if (index === featuredIndex) {
        img.classList.remove("opacity-0");
        img.classList.add("opacity-100");
        img.setAttribute("aria-hidden", "false");
      } else {
        img.classList.remove("opacity-100");
        img.classList.add("opacity-0");
        img.setAttribute("aria-hidden", "true");
      }
    });
  }, [featuredIndex]);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };

    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    if (candidates.length <= 1) {
      return;
    }

    featuredRemainingRef.current = FEATURED_INTERVAL_MS;
    featuredStartRef.current = performance.now();
  }, [featuredIndex, candidates.length]);

  const isAutoPlayPaused = isFeaturedPaused || !isPageVisible;
  const currentFeatured = candidates[featuredIndex] ?? candidates[0];

  useEffect(() => {
    if (candidates.length <= 1) {
      return;
    }

    if (isAutoPlayPaused) {
      const elapsed = performance.now() - featuredStartRef.current;
      featuredRemainingRef.current = Math.max(FEATURED_INTERVAL_MS - elapsed, 0);

      return;
    }

    featuredStartRef.current =
      performance.now() - (FEATURED_INTERVAL_MS - featuredRemainingRef.current);

    const timer = setTimeout(() => {
      featuredRemainingRef.current = FEATURED_INTERVAL_MS;
      setFeaturedIndex((prev) => (prev + 1) % candidates.length);
    }, featuredRemainingRef.current);

    return () => clearTimeout(timer);
  }, [featuredIndex, candidates.length, isAutoPlayPaused]);

  const handleClick = () => {
    router.push(PAGE_ROUTES.WATCH(currentFeatured.slug, currentFeatured.shortId));
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleClick();
        }
      }}
      aria-label={currentFeatured.title}
      onMouseEnter={canHover ? () => setIsFeaturedPaused(true) : undefined}
      onMouseLeave={canHover ? () => setIsFeaturedPaused(false) : undefined}
      className={`group recording-card-enter relative mb-8 block cursor-pointer overflow-hidden rounded-[32px] bg-white/90 text-neutral-900 shadow-xl ring-1 shadow-black/10 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/20 dark:ring-white/10 ${
        hasFeaturedHero ? "min-h-[420px] sm:min-h-0" : ""
      }`}
    >
      <div
        ref={imageContainerRef}
        className={
          hasFeaturedHero
            ? "absolute inset-0 z-0 sm:relative sm:aspect-[16/7] sm:w-full"
            : "relative aspect-[16/7] w-full"
        }
      >
        {imageElements}
        {candidates.length > 1 && (
          <>
            <div className="pointer-events-none absolute inset-0 z-10">
              <button
                type="button"
                aria-label={previousLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsFeaturedPaused(false);
                  setFeaturedIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
                }}
                className="pointer-events-auto absolute inset-y-0 left-0 w-1/5 cursor-pointer"
              />
              <button
                type="button"
                aria-label={nextLabel}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsFeaturedPaused(false);
                  setFeaturedIndex((prev) => (prev + 1) % candidates.length);
                }}
                className="pointer-events-auto absolute inset-y-0 right-0 w-1/5 cursor-pointer"
              />
            </div>
            <div className="absolute top-4 right-6 left-6 z-10 flex gap-2">
              {candidates.map((item, index) => {
                const isActive = index === featuredIndex;

                return (
                  <div
                    key={`progress-${item.shortId}`}
                    className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/40 dark:bg-white/20"
                  >
                    <span
                      key={
                        isActive
                          ? `active-${item.shortId}-${featuredIndex}`
                          : `inactive-${item.shortId}`
                      }
                      className={`block h-full rounded-full ${
                        isActive
                          ? "hero-progress-fill"
                          : index < featuredIndex
                            ? "bg-white"
                            : "bg-white/20"
                      }`}
                      style={
                        isActive
                          ? {
                              animationDuration: `${FEATURED_INTERVAL_MS}ms`,
                              animationPlayState: isAutoPlayPaused ? "paused" : "running",
                            }
                          : index < featuredIndex
                            ? { width: "100%" }
                            : { width: "0%" }
                      }
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div className="absolute right-4 bottom-4 left-4 z-20 sm:right-6 sm:bottom-6 sm:left-6">
        {candidateContents.map((content, index) => (
          <div
            key={candidates[index].shortId}
            className={index === featuredIndex ? "block" : "hidden"}
          >
            {content}
          </div>
        ))}
      </div>
    </article>
  );
}
