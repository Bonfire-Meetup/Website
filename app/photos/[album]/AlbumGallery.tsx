"use client";

import { useState } from "react";
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

export function AlbumGallery({ images, baseUrl, title, downloadLabel }: AlbumGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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
            onClick={() => setLightboxIndex(index)}
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
          onClose={() => setLightboxIndex(null)}
          downloadLabel={downloadLabel}
        />
      )}
    </>
  );
}
