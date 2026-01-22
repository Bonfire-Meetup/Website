"use client";

import { useEffect, useRef, useState } from "react";

interface HeroImage {
  src: string;
  alt: string;
}

export function HeroBackground({ images }: { images: HeroImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInView, setIsInView] = useState(true);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isInView || !isPageVisible) {
      return;
    }
    const nextIndex = (currentIndex + 1) % images.length;
    const nextImage = images[nextIndex];
    const img = new Image();
    img.src = nextImage.src;
  }, [currentIndex, images, isInView, isPageVisible]);

  useEffect(() => {
    if (!isInView || !isPageVisible || images.length <= 1) {
      return;
    }
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length, isInView, isPageVisible]);

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

  const prevIndex = (currentIndex - 1 + images.length) % images.length;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 opacity-40 mix-blend-multiply dark:opacity-40 dark:mix-blend-normal"
    >
      {images.map((image, index) => {
        const isActive = index === currentIndex;
        const isPrev = index === prevIndex;
        const isVisible = isActive || isPrev;

        const backgroundImage = `url(${image.src})`;

        return (
          <div
            key={image.src}
            className={`absolute inset-0 bg-cover bg-center will-change-transform ${
              isActive ? "opacity-60" : "opacity-0"
            }`}
            style={{
              backgroundImage,
              transform: isVisible ? "scale(1.15)" : "scale(1)",
              transition: isVisible
                ? "opacity 2000ms ease-in-out, transform 20s linear"
                : "opacity 2000ms ease-in-out, transform 0s",
            }}
            aria-hidden="true"
          />
        );
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-[#fafafa]/80 to-transparent dark:from-[#050505] dark:via-[#050505]/80 dark:to-transparent" />
    </div>
  );
}
