"use client";

import { type CatalogRecording } from "@/lib/recordings/catalog-types";

import {
  buildFeaturedCandidateContents,
  buildFeaturedImageElements,
} from "./featured-carousel-builders";
import { FeaturedCarouselWrapper } from "./FeaturedCarouselWrapper";

export function FeaturedRecording({
  featured: _featured,
  candidates,
  locale,
  filterKey,
  canHover,
  onNavigate,
  previousLabel,
  nextLabel,
}: {
  featured: CatalogRecording;
  candidates: CatalogRecording[];
  locale: string;
  filterKey: string;
  canHover: boolean;
  onNavigate: (slug: string, shortId: string) => void;
  previousLabel: string;
  nextLabel: string;
}) {
  const hasFeaturedHero = Boolean(candidates[0]?.featureHeroThumbnail);

  const imageElements = buildFeaturedImageElements(candidates);
  const candidateContents = buildFeaturedCandidateContents({
    candidates,
    locale,
    hasFeaturedHero,
    showAccessPill: true,
  });

  return (
    <FeaturedCarouselWrapper
      candidates={candidates}
      candidateContents={candidateContents}
      imageElements={imageElements}
      hasFeaturedHero={hasFeaturedHero}
      previousLabel={previousLabel}
      nextLabel={nextLabel}
      onNavigate={onNavigate}
      canHover={canHover}
      resetKey={filterKey}
    />
  );
}
