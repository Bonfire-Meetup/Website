"use client";

import { useEffect, useState } from "react";

type HeroImage = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  fallbackType?: "image/jpeg" | "image/png";
};

export function HeroBackground({ images }: { images: HeroImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [supportsWebp, setSupportsWebp] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("CSS" in window)) return;
    setSupportsWebp(
      CSS.supports(
        "background-image",
        'url("data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAQAcJaQAA3AA/vsAAA==")',
      ),
    );
  }, []);

  useEffect(() => {
    const nextIndex = (currentIndex + 1) % images.length;
    const nextImage = images[nextIndex];
    const img = new Image();
    img.src =
      supportsWebp && nextImage.fallbackSrc
        ? nextImage.src
        : (nextImage.fallbackSrc ?? nextImage.src);
  }, [currentIndex, images, supportsWebp]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  const prevIndex = (currentIndex - 1 + images.length) % images.length;

  return (
    <div className="absolute inset-0 z-0 opacity-40 dark:opacity-40 mix-blend-multiply dark:mix-blend-normal">
      {images.map((image, index) => {
        const isActive = index === currentIndex;
        const isPrev = index === prevIndex;
        const isVisible = isActive || isPrev;

        const backgroundImage =
          supportsWebp && image.fallbackSrc
            ? `url(${image.src})`
            : `url(${image.fallbackSrc ?? image.src})`;

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
