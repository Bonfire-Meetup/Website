import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import {
  HiddenGemsRailServer,
  HotPicksRailServer,
  MemberPicksRailServer,
} from "@/components/recordings/TrendingRailsServer";
import { TrendingRailSkeleton } from "@/components/shared/Skeletons";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { normalizeText } from "@/lib/utils/text";

const RecordingsCatalog = dynamic(() =>
  import("@/components/recordings/RecordingsCatalog").then((mod) => mod.RecordingsCatalog),
);

type LocationFilter = "all" | LocationValue;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; tag?: string; episode?: string; q?: string }>;
}) {
  const tCommon = await getTranslations("common");
  const params = await searchParams;

  const locationParam = params.location;
  const isPragueLocation = locationParam === LOCATIONS.PRAGUE;
  const isZlinLocation = locationParam === LOCATIONS.ZLIN;
  const isValidLocation = isPragueLocation || isZlinLocation;
  const initialLocation: LocationFilter = isValidLocation && locationParam ? locationParam : "all";
  const initialTag = params.tag ?? "all";
  const initialEpisode = params.episode ?? "all";
  const initialSearchQuery = params.q ?? "";
  const normalizedSearchQuery = normalizeText(initialSearchQuery.trim());

  const isLocationFiltered = initialLocation !== "all";
  const isTagFiltered = initialTag !== "all";
  const isEpisodeFiltered = initialEpisode !== "all";
  const isSearchFiltered = initialSearchQuery.trim() !== "";
  const hasActiveFilters =
    isLocationFiltered || isTagFiltered || isEpisodeFiltered || isSearchFiltered;
  const initialViewMode: "rows" | "grid" = hasActiveFilters ? "grid" : "rows";

  const recordings = getAllRecordings().map((recording) => ({
    date: recording.date,
    description: recording.description,
    episode: recording.episode,
    episodeId: recording.episodeId,
    episodeNumber: recording.episodeNumber,
    featureHeroThumbnail: recording.featureHeroThumbnail,
    location: recording.location,
    shortId: recording.shortId,
    slug: recording.slug,
    speaker: recording.speaker,
    tags: recording.tags,
    thumbnail: recording.thumbnail,
    title: recording.title,
  }));

  const preFilteredRecordings = recordings.filter((recording) => {
    const isLocationMatch = initialLocation === "all" || recording.location === initialLocation;
    const isTagMatch = initialTag === "all" || recording.tags.includes(initialTag);
    const isEpisodeMatch = initialEpisode === "all" || recording.episodeId === initialEpisode;

    const isSearchEmpty = normalizedSearchQuery.length === 0;
    const isTitleMatch = normalizeText(recording.title).includes(normalizedSearchQuery);
    const isSpeakerMatch = recording.speaker.some((name) =>
      normalizeText(name).includes(normalizedSearchQuery),
    );
    const isTagInSearch = recording.tags.some((tag) =>
      normalizeText(tag).includes(normalizedSearchQuery),
    );
    const isLocationInSearch = normalizeText(recording.location).includes(normalizedSearchQuery);
    const hasEpisode = Boolean(recording.episode);
    const isEpisodeInSearch =
      hasEpisode && recording.episode
        ? normalizeText(recording.episode).includes(normalizedSearchQuery)
        : false;
    const hasDescription = Boolean(recording.description);
    const isDescriptionMatch =
      hasDescription && recording.description
        ? normalizeText(recording.description).includes(normalizedSearchQuery)
        : false;

    const isSearchMatch =
      isSearchEmpty ||
      isTitleMatch ||
      isSpeakerMatch ||
      isTagInSearch ||
      isLocationInSearch ||
      isEpisodeInSearch ||
      isDescriptionMatch;

    return isLocationMatch && isTagMatch && isEpisodeMatch && isSearchMatch;
  });

  const scrollLeftLabel = tCommon("scrollLeft");
  const scrollRightLabel = tCommon("scrollRight");

  return (
    <main className="gradient-bg min-h-screen pt-24">
      <RecordingsCatalog
        recordings={recordings}
        scrollLeftLabel={scrollLeftLabel}
        scrollRightLabel={scrollRightLabel}
        previousFeaturedLabel={tCommon("previousFeatured")}
        nextFeaturedLabel={tCommon("nextFeatured")}
        initialFilters={{
          episode: initialEpisode,
          location: initialLocation,
          searchQuery: initialSearchQuery,
          tag: initialTag,
          viewMode: initialViewMode,
        }}
        preFilteredRecordings={preFilteredRecordings}
        trendingSlots={{
          memberPicks: (
            <Suspense key="member-picks" fallback={<TrendingRailSkeleton />}>
              <MemberPicksRailServer
                scrollLeftLabel={scrollLeftLabel}
                scrollRightLabel={scrollRightLabel}
              />
            </Suspense>
          ),
          hotPicks: (
            <Suspense key="hot-picks" fallback={<TrendingRailSkeleton />}>
              <HotPicksRailServer
                scrollLeftLabel={scrollLeftLabel}
                scrollRightLabel={scrollRightLabel}
              />
            </Suspense>
          ),
          hiddenGems: (
            <Suspense key="hidden-gems" fallback={<TrendingRailSkeleton />}>
              <HiddenGemsRailServer
                scrollLeftLabel={scrollLeftLabel}
                scrollRightLabel={scrollRightLabel}
              />
            </Suspense>
          ),
        }}
      />
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("libraryDescription"),
    openGraph: {
      description: t("libraryDescription"),
      title: t("libraryTitle", commonValues),
      type: "website",
    },
    title: t("libraryTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("libraryDescription"),
      title: t("libraryTitle", commonValues),
    },
  };
}
