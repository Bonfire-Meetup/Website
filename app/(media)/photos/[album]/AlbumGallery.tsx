"use client";

import { useCallback, useEffect, useState } from "react";

import { AlbumImage } from "@/components/shared/AlbumImage";
import { Lightbox } from "@/components/shared/Lightbox";

interface Image {
  src: string;
  width: number;
  height: number;
}

interface AlbumGalleryProps {
  images: Image[];
  baseUrl: string;
  title: string;
  downloadLabel: string;
  closeLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
}

function parsePhotoHash(): number | null {
  if (typeof window === "undefined") {
    return null;
  }

  const match = window.location.hash.match(/^#photo-(?<index>\d+)$/u);

  if (!match) {
    return null;
  }

  const num = parseInt(match[1], 10);

  return num >= 1 ? num - 1 : null;
}

export function AlbumGallery({
  images,
  baseUrl,
  title,
  downloadLabel,
  closeLabel,
  previousLabel,
  nextLabel,
}: AlbumGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const hashIndex = parsePhotoHash();

    if (hashIndex !== null && hashIndex < images.length) {
      setLightboxIndex(hashIndex);
    }
  }, [images.length]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    window.history.replaceState(null, "", `#photo-${index + 1}`);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const handleIndexChange = useCallback((newIndex: number) => {
    setLightboxIndex(newIndex);
    window.history.replaceState(null, "", `#photo-${newIndex + 1}`);
  }, []);

  const lightboxImages = images.map((img, i) => ({
    alt: `${title} ${i + 1}`,
    src: `${baseUrl}/${img.src}`,
  }));

  return (
    <>
      <div className="flex flex-col gap-6 sm:block sm:columns-2 sm:gap-4 lg:columns-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => openLightbox(index)}
            className="surface group sm:hover:shadow-raised relative block w-full break-inside-avoid overflow-hidden sm:mb-4 sm:cursor-zoom-in sm:transition-all"
          >
            <div className="eyebrow text-2xs absolute top-3 left-3 z-20 rounded-full border border-white/30 bg-black/50 px-2.5 py-1 text-white backdrop-blur-sm">
              #{index + 1}
            </div>
            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_55%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <AlbumImage
              src={`${baseUrl}/${image.src}`}
              alt={`${title} ${index + 1}`}
              width={image.width}
              height={image.height}
              imgClassName="transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
          onIndexChange={handleIndexChange}
          downloadLabel={downloadLabel}
          closeLabel={closeLabel}
          previousLabel={previousLabel}
          nextLabel={nextLabel}
        />
      )}
    </>
  );
}
