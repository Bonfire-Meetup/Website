import type { CatalogRecording } from "@/lib/recordings/catalog-types";

import {
  buildFeaturedCandidateContents,
  buildFeaturedImageElements,
} from "./featured-carousel-builders";
import { FeaturedCarouselWrapper } from "./FeaturedCarouselWrapper";

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
  const imageElements = buildFeaturedImageElements(candidates);
  const candidateContents = buildFeaturedCandidateContents({
    candidates,
    locale,
    hasFeaturedHero,
  });

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
