"use client";

import { useEffect, useRef, useState } from "react";

import { FEATURED_INTERVAL_MS } from "@/lib/recordings/catalog-types";

interface UseFeaturedCarouselOptions {
  count: number;
  resetKey?: string;
}

export function useFeaturedCarousel({ count, resetKey }: UseFeaturedCarouselOptions) {
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
    if (typeof resetKey === "string") {
      setFeaturedIndex(0);
      setIsFeaturedPaused(false);
    }
  }, [resetKey]);

  useEffect(() => {
    if (count <= 0) {
      setFeaturedIndex(0);
      return;
    }

    setFeaturedIndex((prev) => Math.min(prev, count - 1));
  }, [count]);

  useEffect(() => {
    if (count <= 1) {
      return;
    }

    featuredRemainingRef.current = FEATURED_INTERVAL_MS;
    featuredStartRef.current = performance.now();
  }, [featuredIndex, count]);

  const isAutoPlayPaused = isFeaturedPaused || !isPageVisible;

  useEffect(() => {
    if (count <= 1) {
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
      setFeaturedIndex((prev) => (prev + 1) % count);
    }, featuredRemainingRef.current);

    return () => clearTimeout(timer);
  }, [count, featuredIndex, isAutoPlayPaused]);

  return {
    featuredIndex,
    isAutoPlayPaused,
    setFeaturedIndex,
    setIsFeaturedPaused,
  };
}
