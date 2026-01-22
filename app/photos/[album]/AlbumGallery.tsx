"use client";

import { useState, useEffect, useCallback } from "react";
import { AlbumImage } from "../../components/shared/AlbumImage";
import { Lightbox } from "./Lightbox";

type Image = {
  src: string;
  width: number;
  height: number;
};

type AlbumGalleryProps = {
  images: Image[];
  baseUrl: string;
  title: string;
  downloadLabel: string;
  closeLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
};

function parsePhotoHash(): number | null {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(/^#photo-(\d+)$/);
  if (!match) return null;
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
    src: `${baseUrl}/${img.src}`,
    alt: `${title} ${i + 1}`,
  }));

  return (
    <>
      <div className="flex flex-col gap-6 sm:block sm:columns-2 sm:gap-4 lg:columns-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => openLightbox(index)}
            className="glass-card no-hover-pop block w-full break-inside-avoid overflow-hidden rounded-2xl ring-1 ring-black/5 shadow-lg shadow-black/5 sm:mb-4 sm:cursor-zoom-in sm:transition-transform sm:hover:scale-[1.02] dark:ring-white/10 dark:shadow-black/20"
          >
            <AlbumImage
              src={`${baseUrl}/${image.src}`}
              alt={`${title} ${index + 1}`}
              width={image.width}
              height={image.height}
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
