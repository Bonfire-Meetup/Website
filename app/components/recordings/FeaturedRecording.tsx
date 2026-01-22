"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Pill } from "../ui/Pill";
import { FEATURED_INTERVAL_MS } from "./RecordingsCatalogTypes";
import type { CatalogRecording } from "./RecordingsCatalogTypes";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function FeaturedRecording({
  featured: _featured,
  candidates,
  locale,
  filterKey,
  canHover,
  onNavigate,
  previousLabel,
  nextLabel,
}: {
  featured: CatalogRecording;
  candidates: CatalogRecording[];
  locale: string;
  filterKey: string;
  canHover: boolean;
  onNavigate: (slug: string, shortId: string) => void;
  previousLabel?: string;
  nextLabel?: string;
}) {
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const featuredStartRef = useRef(0);
  const featuredRemainingRef = useRef(FEATURED_INTERVAL_MS);

  useEffect(() => {
    const handleVisibility = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    setFeaturedIndex(0);
  }, [filterKey]);

  useEffect(() => {
    if (candidates.length <= 1) return;
    featuredRemainingRef.current = FEATURED_INTERVAL_MS;
    featuredStartRef.current = performance.now();
  }, [featuredIndex, candidates.length]);

  const isAutoPlayPaused = isFeaturedPaused || !isPageVisible;
  const currentFeatured = candidates[featuredIndex] ?? candidates[0];
  const hasFeaturedHero = Boolean(currentFeatured?.featureHeroThumbnail);
  const featuredThumbnail = hasFeaturedHero
    ? currentFeatured?.featureHeroThumbnail
    : currentFeatured?.thumbnail;

  useEffect(() => {
    if (candidates.length <= 1) return;

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
    onNavigate(currentFeatured.slug, currentFeatured.shortId);
  };

  return (
    <article
      key={`featured-${currentFeatured.shortId}-${filterKey}`}
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
      className={`group recording-card-enter relative mb-8 block cursor-pointer overflow-hidden rounded-[32px] bg-white/90 text-neutral-900 shadow-xl shadow-black/10 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/20 dark:ring-white/10 ${
        hasFeaturedHero ? "min-h-[420px] sm:min-h-0" : ""
      }`}
    >
      <div
        className={
          hasFeaturedHero
            ? "absolute inset-0 z-0 sm:relative sm:aspect-[16/7] sm:w-full"
            : "relative aspect-[16/7] w-full"
        }
      >
        <Image
          src={featuredThumbnail ?? currentFeatured.thumbnail}
          alt={currentFeatured.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 70vw"
          priority
          loading="eager"
        />
        {candidates.length > 1 && (
          <>
            <div className="absolute inset-0 z-10 pointer-events-none">
              <button
                type="button"
                aria-label={previousLabel ?? "Previous featured"}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsFeaturedPaused(false);
                  setFeaturedIndex((prev) => (prev - 1 + candidates.length) % candidates.length);
                }}
                className="pointer-events-auto absolute inset-y-0 left-0 w-1/5 cursor-pointer"
              />
              <button
                type="button"
                aria-label={nextLabel ?? "Next featured"}
                onClick={(event) => {
                  event.stopPropagation();
                  setIsFeaturedPaused(false);
                  setFeaturedIndex((prev) => (prev + 1) % candidates.length);
                }}
                className="pointer-events-auto absolute inset-y-0 right-0 w-1/5 cursor-pointer"
              />
            </div>
            <div className="absolute top-4 left-6 right-6 z-10 flex gap-2">
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
      <div className="absolute bottom-4 left-4 right-4 z-20 sm:bottom-6 sm:left-6 sm:right-6">
        <div
          className={`flex max-w-2xl flex-col gap-2 rounded-3xl px-4 py-4 sm:px-5 sm:py-4 ${
            hasFeaturedHero
              ? "bg-black/60 text-white ring-1 ring-white/10 sm:bg-white/90 sm:text-neutral-900 sm:ring-black/5 dark:sm:bg-black/60 dark:sm:text-white dark:sm:ring-white/10"
              : "bg-white/85 text-neutral-900 ring-1 ring-black/5 dark:bg-black/60 dark:text-white dark:ring-white/10"
          }`}
        >
          <div
            className={`flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] ${
              hasFeaturedHero
                ? "text-white/80 sm:text-neutral-600 dark:sm:text-white/70"
                : "text-neutral-600 dark:text-white/70"
            }`}
          >
            <Pill
              size="xs"
              className={`${
                hasFeaturedHero
                  ? "bg-white/15 text-white/90 sm:bg-black/5 sm:text-neutral-700 dark:sm:bg-white/10 dark:sm:text-white/80"
                  : "bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-white/80"
              }`}
            >
              {currentFeatured.location}
            </Pill>
            <span>
              {new Date(currentFeatured.date).toLocaleDateString(locale, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <h2
            className={`break-words text-xl font-semibold leading-tight line-clamp-2 sm:text-3xl lg:text-4xl ${
              hasFeaturedHero
                ? "text-white sm:text-neutral-900 dark:sm:text-white"
                : "text-neutral-900 dark:text-white"
            }`}
          >
            {currentFeatured.title}
          </h2>
          <div className="flex flex-col gap-1.5">
            {currentFeatured.speaker.map((name: string) => (
              <div key={name} className="flex items-center gap-2">
                <span className="speaker-dot" />
                <span
                  className={`text-xs font-medium sm:text-sm ${
                    hasFeaturedHero
                      ? "text-white/90 sm:text-neutral-900/80 dark:sm:text-white/80"
                      : "text-neutral-900/80 dark:text-white/80"
                  }`}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
          <p
            className={`text-xs sm:text-base ${
              hasFeaturedHero
                ? "text-white/70 sm:text-neutral-600 dark:sm:text-white/70"
                : "text-neutral-600 dark:text-white/70"
            }`}
          >
            {currentFeatured.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {currentFeatured.tags.map((tag: string) => (
              <Pill
                key={tag}
                href={`${PAGE_ROUTES.LIBRARY}?tag=${encodeURIComponent(tag)}`}
                onClick={(event) => event.stopPropagation()}
                size="xs"
                className={`font-semibold transition hover:text-neutral-900 dark:hover:text-white ${
                  hasFeaturedHero
                    ? "bg-white/10 text-white/75 sm:bg-black/5 sm:text-neutral-600 dark:sm:bg-white/10 dark:sm:text-white/70"
                    : "bg-black/5 text-neutral-600 dark:bg-white/10 dark:text-white/70"
                }`}
              >
                {tag}
              </Pill>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
