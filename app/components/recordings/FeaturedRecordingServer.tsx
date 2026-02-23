import type { CatalogRecording } from "./RecordingsCatalogTypes";
import Image from "next/image";

import { FeaturedCarouselWrapper } from "./FeaturedCarouselWrapper";
import { RecordingFeaturedContent } from "./RecordingFeaturedContent";

interface FeaturedRecordingServerProps {
  candidates: CatalogRecording[];
  locale: string;
  previousLabel: string;
  nextLabel: string;
}

export function FeaturedRecordingServer({
  candidates,
  locale,
  previousLabel,
  nextLabel,
}: FeaturedRecordingServerProps) {
  if (candidates.length === 0) {
    return null;
  }

  const hasFeaturedHero = Boolean(candidates[0]?.featureHeroThumbnail);

  const imageElements = (
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

  const candidateContents = candidates.map((recording) => (
    <RecordingFeaturedContent
      key={recording.shortId}
      recording={recording}
      locale={locale}
      hasFeaturedHero={hasFeaturedHero}
    />
  ));

  return (
    <FeaturedCarouselWrapper
      candidates={candidates}
      candidateContents={candidateContents}
      imageElements={imageElements}
      hasFeaturedHero={hasFeaturedHero}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
    />
  );
}
