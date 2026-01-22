"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Callback = () => void;
const callbacks = new WeakMap<Element, Callback>();

let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver() {
  if (sharedObserver) {
    return sharedObserver;
  }

  sharedObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const cb = callbacks.get(entry.target);

          if (cb) {
            cb();
            callbacks.delete(entry.target);
            sharedObserver?.unobserve(entry.target);
          }
        }
      });
    },
    { rootMargin: "200px" },
  );

  return sharedObserver;
}

function observe(el: Element, callback: Callback) {
  callbacks.set(el, callback);
  getSharedObserver().observe(el);
}

function unobserve(el: Element) {
  callbacks.delete(el);
  sharedObserver?.unobserve(el);
}

interface RecordingImageProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
}

export function RecordingImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  loading = "lazy",
  fetchPriority = "low",
}: RecordingImageProps) {
  const [inView, setInView] = useState(loading === "eager");
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (loading === "eager") {
      setInView(true);

      return;
    }

    const container = containerRef.current;

    if (!container) {
      return;
    }

    observe(container, () => setInView(true));

    return () => unobserve(container);
  }, [loading]);

  return (
    <div ref={containerRef} className={`relative aspect-video w-full overflow-hidden ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-neutral-200/70 dark:bg-white/5" />
      )}
      {inView && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={fetchPriority === "high"}
          onLoad={() => setLoaded(true)}
          className={`object-cover transition-opacity transition-transform duration-500 duration-700 ease-out ${imgClassName} ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
