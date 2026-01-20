"use client";

import { useEffect, useRef, useState } from "react";

type Callback = () => void;
const callbacks = new WeakMap<Element, Callback>();

let sharedObserver: IntersectionObserver | null = null;

function getSharedObserver() {
  if (sharedObserver) return sharedObserver;

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

type AlbumImageProps = {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: "eager" | "lazy";
  fetchPriority?: "high" | "low" | "auto";
  width?: number;
  height?: number;
};

export function AlbumImage({
  src,
  alt,
  className = "",
  imgClassName = "",
  loading = "lazy",
  fetchPriority = "low",
  width,
  height,
}: AlbumImageProps) {
  const [inView, setInView] = useState(loading === "eager");
  const [loaded, setLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const aspectRatio = width && height ? { aspectRatio: `${width} / ${height}` } : undefined;

  useEffect(() => {
    if (loading === "eager") {
      setInView(true);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    observe(container, () => setInView(true));
    return () => unobserve(container);
  }, [loading]);

  useEffect(() => {
    if (inView && imgRef.current?.complete) {
      setLoaded(true);
    }
  }, [inView, src]);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} style={aspectRatio}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-neutral-200/70 dark:bg-white/5" />
      )}
      {inView && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          decoding="async"
          fetchPriority={fetchPriority}
          width={width}
          height={height}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-opacity duration-500 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
    </div>
  );
}
