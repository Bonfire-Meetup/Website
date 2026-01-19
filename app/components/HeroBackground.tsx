"use client";

import { useEffect, useState } from "react";

export function HeroBackground({ images }: { images: Array<{ src: string; alt: string }> }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Preload next image for performance
  useEffect(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    const img = new Image();
    img.src = images[nextIndex].src;
  }, [currentIndex, images]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000); // 6 seconds per image
    return () => clearInterval(timer);
  }, [images.length]);

  const prevIndex = (currentIndex - 1 + images.length) % images.length;

  return (
    <div className="absolute inset-0 z-0 opacity-40 dark:opacity-40 mix-blend-multiply dark:mix-blend-normal">
      {images.map((image, index) => {
        const isActive = index === currentIndex;
        const isPrev = index === prevIndex;
        const isVisible = isActive || isPrev;

        return (
          <div
            key={image.src}
            className={`absolute inset-0 bg-cover bg-center will-change-transform ${
              isActive ? "opacity-60" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${image.src})`,
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
