import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";
import { getHotRecordings } from "@/lib/recordings/hot-picks";
import { getMemberPicks } from "@/lib/recordings/member-picks";
import { getAllRecordings } from "@/lib/recordings/recordings";

const RecordingsCatalog = dynamic(() =>
  import("@/components/recordings/RecordingsCatalog").then((mod) => mod.RecordingsCatalog),
);

import { normalizeText } from "@/lib/utils/text";

type LocationFilter = "all" | LocationValue;

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ location?: string; tag?: string; episode?: string; q?: string }>;
}) {
  const tCommon = await getTranslations("common");
  const params = await searchParams;

  const [allRecordings, memberPicksData, hotPicksData] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    getMemberPicks(6),
    getHotRecordings(6),
  ]);

  const locationParam = params.location;
  const isPragueLocation = locationParam === LOCATIONS.PRAGUE;
  const isZlinLocation = locationParam === LOCATIONS.ZLIN;
  const isValidLocation = isPragueLocation || isZlinLocation;
  const initialLocation: LocationFilter = isValidLocation && locationParam ? locationParam : "all";
  const initialTag = params.tag ?? "all";
  const initialEpisode = params.episode ?? "all";
  const initialSearchQuery = params.q ?? "";

  const normalizedSearchQuery = normalizeText(initialSearchQuery.trim());
  const serverFilteredRecordings = allRecordings.filter((recording) => {
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

  const isLocationFiltered = initialLocation !== "all";
  const isTagFiltered = initialTag !== "all";
  const isEpisodeFiltered = initialEpisode !== "all";
  const isSearchFiltered = initialSearchQuery.trim() !== "";
  const hasActiveFilters =
    isLocationFiltered || isTagFiltered || isEpisodeFiltered || isSearchFiltered;
  const initialViewMode: "rows" | "grid" = hasActiveFilters ? "grid" : "rows";

  const recordings = allRecordings.map((recording) => ({
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

  const memberPicks = memberPicksData.map((recording) => ({
    boostCount: recording.boostCount,
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

  const hotPicks = hotPicksData.map((recording) => ({
    date: recording.date,
    description: recording.description,
    episode: recording.episode,
    episodeId: recording.episodeId,
    episodeNumber: recording.episodeNumber,
    featureHeroThumbnail: recording.featureHeroThumbnail,
    likeCount: recording.likeCount,
    location: recording.location,
    shortId: recording.shortId,
    slug: recording.slug,
    speaker: recording.speaker,
    tags: recording.tags,
    thumbnail: recording.thumbnail,
    title: recording.title,
  }));

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-24">
        <RecordingsCatalog
          recordings={recordings}
          memberPicks={memberPicks}
          hotPicks={hotPicks}
          scrollLeftLabel={tCommon("scrollLeft")}
          scrollRightLabel={tCommon("scrollRight")}
          previousFeaturedLabel={tCommon("previousFeatured")}
          nextFeaturedLabel={tCommon("nextFeatured")}
          initialFilters={{
            episode: initialEpisode,
            location: initialLocation,
            searchQuery: initialSearchQuery,
            tag: initialTag,
            viewMode: initialViewMode,
          }}
          preFilteredRecordings={serverFilteredRecordings.map((recording) => ({
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
          }))}
        />
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
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
