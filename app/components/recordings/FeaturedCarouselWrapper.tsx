"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { FEATURED_INTERVAL_MS, type CatalogRecording } from "@/lib/recordings/catalog-types";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { useFeaturedCarousel } from "./useFeaturedCarousel";

interface FeaturedCarouselWrapperProps {
  candidates: CatalogRecording[];
  candidateContents: ReactNode[];
  imageElements: ReactNode;
  hasFeaturedHero: boolean;
  previousLabel: string;
  nextLabel: string;
  onNavigate?: (slug: string, shortId: string) => void;
  canHover?: boolean;
  resetKey?: string;
}

export function FeaturedCarouselWrapper({
  candidates,
  candidateContents,
  imageElements,
  hasFeaturedHero,
  previousLabel,
  nextLabel,
  onNavigate,
  canHover: canHoverOverride,
  resetKey,
}: FeaturedCarouselWrapperProps) {
  const router = useRouter();
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);
  const { featuredIndex, isAutoPlayPaused, setFeaturedIndex, setIsFeaturedPaused } =
    useFeaturedCarousel({
      count: candidates.length,
      resetKey,
    });

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

  const currentFeatured = candidates[featuredIndex] ?? candidates[0];

  const handleClick = () => {
    if (onNavigate) {
      onNavigate(currentFeatured.slug, currentFeatured.shortId);
      return;
    }

    router.push(PAGE_ROUTES.WATCH(currentFeatured.slug, currentFeatured.shortId));
  };

  const hoverEnabled = canHoverOverride ?? canHover;

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
      onMouseEnter={hoverEnabled ? () => setIsFeaturedPaused(true) : undefined}
      onMouseLeave={hoverEnabled ? () => setIsFeaturedPaused(false) : undefined}
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
        {candidates.map((candidate, index) => (
          <div key={candidate.shortId} className={index === featuredIndex ? "block" : "hidden"}>
            {candidateContents[index]}
          </div>
        ))}
      </div>
    </article>
  );
}
