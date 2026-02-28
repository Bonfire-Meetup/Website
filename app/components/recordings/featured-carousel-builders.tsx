import Image from "next/image";
import type { ReactNode } from "react";

import { type CatalogRecording } from "@/lib/recordings/catalog-types";

import { RecordingFeaturedContent } from "./RecordingFeaturedContent";

export function buildFeaturedImageElements(candidates: CatalogRecording[]): ReactNode {
  return (
    <>
      {candidates.map((item, index) => {
        const imageSrc = item.featureHeroThumbnail || item.thumbnail;

        return (
          <Image
            key={`featured-image-${item.shortId}`}
            src={imageSrc}
            alt={index === 0 ? item.title : ""}
            aria-hidden={index !== 0}
            fill
            data-index={index}
            className={`featured-carousel-image absolute inset-0 object-cover transition duration-700 group-hover:scale-105 ${
              index === 0 ? "opacity-100" : "opacity-0"
            }`}
            sizes="(max-width: 1024px) 100vw, 70vw"
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
          />
        );
      })}
    </>
  );
}

export function buildFeaturedCandidateContents({
  candidates,
  locale,
  hasFeaturedHero,
  showAccessPill = false,
}: {
  candidates: CatalogRecording[];
  locale: string;
  hasFeaturedHero: boolean;
  showAccessPill?: boolean;
}) {
  return candidates.map((recording) => (
    <RecordingFeaturedContent
      key={recording.shortId}
      recording={recording}
      locale={locale}
      hasFeaturedHero={hasFeaturedHero}
      showAccessPill={showAccessPill}
    />
  ));
}
