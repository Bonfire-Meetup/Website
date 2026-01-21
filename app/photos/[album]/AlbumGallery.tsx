"use client";

import { useState, useEffect, useCallback } from "react";
import { AlbumImage } from "../../components/AlbumImage";
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
};

function parsePhotoHash(): number | null {
  if (typeof window === "undefined") return null;
  const match = window.location.hash.match(/^#photo-(\d+)$/);
  if (!match) return null;
  const num = parseInt(match[1], 10);
  return num >= 1 ? num - 1 : null;
}

export function AlbumGallery({ images, baseUrl, title, downloadLabel }: AlbumGalleryProps) {
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
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            onClick={() => openLightbox(index)}
            className="mb-4 block w-full cursor-zoom-in break-inside-avoid overflow-hidden rounded-2xl transition-transform hover:scale-[1.02]"
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
        />
      )}
    </>
  );
}
