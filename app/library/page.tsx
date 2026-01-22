import { getLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { getMemberPicks } from "@/lib/recordings/member-picks";
import { getHotRecordings } from "@/lib/recordings/hot-picks";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";

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
  const t = await getTranslations("libraryPage");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const params = await searchParams;

  const [allRecordings, memberPicksData, hotPicksData] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    getMemberPicks(6),
    getHotRecordings(6),
  ]);

  const labels = {
    eyebrow: t("eyebrow"),
    title: t("title"),
    subtitle: t("subtitle"),
    rows: {
      latest: t("rows.latest"),
      prague: t("rows.prague", { prague: tCommon("prague") }),
      zlin: t("rows.zlin", { zlin: tCommon("zlin") }),
      topic: t.raw("rows.topic"),
      memberPicks: t("rows.memberPicks"),
      hot: t("rows.hot"),
    },
    view: {
      all: t("view.all"),
      rows: t("view.rows"),
    },
    search: {
      label: t("search.label"),
      placeholder: t("search.placeholder"),
    },
    filters: {
      title: t("filters.title"),
      location: t("filters.location"),
      tag: t("filters.tag"),
      episode: t("filters.episode"),
      reset: t("filters.reset"),
      allLocations: t("filters.allLocations"),
      allTags: t("filters.allTags"),
      allEpisodes: t("filters.allEpisodes"),
      prague: tCommon("prague"),
      zlin: tCommon("zlin"),
    },
    empty: t("empty"),
    disclaimer: t("disclaimer", { prague: tCommon("prague") }),
    noteLabel: t("noteLabel"),
    epShort: (await getTranslations("recordings"))("epShort"),
    notRecorded: {
      title: t("notRecorded.title"),
      body: t.raw("notRecorded.body"),
      cta: t("notRecorded.cta"),
    },
  };

  const initialLocation: LocationFilter =
    params.location === LOCATIONS.PRAGUE || params.location === LOCATIONS.ZLIN
      ? params.location
      : "all";
  const initialTag = params.tag ?? "all";
  const initialEpisode = params.episode ?? "all";
  const initialSearchQuery = params.q ?? "";

  const normalizedSearchQuery = normalizeText(initialSearchQuery.trim());
  const serverFilteredRecordings = allRecordings.filter((recording) => {
    const matchesLocation = initialLocation === "all" || recording.location === initialLocation;
    const matchesTag = initialTag === "all" || recording.tags.includes(initialTag);
    const matchesEpisode = initialEpisode === "all" || recording.episodeId === initialEpisode;
    const matchesSearch =
      normalizedSearchQuery.length === 0 ||
      normalizeText(recording.title).includes(normalizedSearchQuery) ||
      recording.speaker.some((name) => normalizeText(name).includes(normalizedSearchQuery)) ||
      recording.tags.some((tag) => normalizeText(tag).includes(normalizedSearchQuery)) ||
      normalizeText(recording.location).includes(normalizedSearchQuery) ||
      (recording.episode
        ? normalizeText(recording.episode).includes(normalizedSearchQuery)
        : false) ||
      (recording.description
        ? normalizeText(recording.description).includes(normalizedSearchQuery)
        : false);
    return matchesLocation && matchesTag && matchesEpisode && matchesSearch;
  });

  const hasActiveFilters =
    initialLocation !== "all" ||
    initialTag !== "all" ||
    initialEpisode !== "all" ||
    initialSearchQuery.trim() !== "";
  const initialViewMode: "rows" | "grid" = hasActiveFilters ? "grid" : "rows";

  const recordings = allRecordings.map((recording) => ({
    shortId: recording.shortId,
    slug: recording.slug,
    title: recording.title,
    speaker: recording.speaker,
    date: recording.date,
    thumbnail: recording.thumbnail,
    featureHeroThumbnail: recording.featureHeroThumbnail,
    description: recording.description,
    tags: recording.tags,
    location: recording.location,
    episodeId: recording.episodeId,
    episode: recording.episode,
    episodeNumber: recording.episodeNumber,
  }));

  const memberPicks = memberPicksData.map((recording) => ({
    shortId: recording.shortId,
    slug: recording.slug,
    title: recording.title,
    speaker: recording.speaker,
    date: recording.date,
    thumbnail: recording.thumbnail,
    featureHeroThumbnail: recording.featureHeroThumbnail,
    description: recording.description,
    tags: recording.tags,
    location: recording.location,
    episodeId: recording.episodeId,
    episode: recording.episode,
    episodeNumber: recording.episodeNumber,
    boostCount: recording.boostCount,
  }));

  const hotPicks = hotPicksData.map((recording) => ({
    shortId: recording.shortId,
    slug: recording.slug,
    title: recording.title,
    speaker: recording.speaker,
    date: recording.date,
    thumbnail: recording.thumbnail,
    featureHeroThumbnail: recording.featureHeroThumbnail,
    description: recording.description,
    tags: recording.tags,
    location: recording.location,
    episodeId: recording.episodeId,
    episode: recording.episode,
    episodeNumber: recording.episodeNumber,
    likeCount: recording.likeCount,
  }));

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-24">
        <RecordingsCatalog
          recordings={recordings}
          memberPicks={memberPicks}
          hotPicks={hotPicks}
          labels={labels}
          locale={locale}
          scrollLeftLabel={tCommon("scrollLeft")}
          scrollRightLabel={tCommon("scrollRight")}
          previousFeaturedLabel={tCommon("previousFeatured")}
          nextFeaturedLabel={tCommon("nextFeatured")}
          initialFilters={{
            location: initialLocation,
            tag: initialTag,
            episode: initialEpisode,
            searchQuery: initialSearchQuery,
            viewMode: initialViewMode,
          }}
          preFilteredRecordings={serverFilteredRecordings.map((recording) => ({
            shortId: recording.shortId,
            slug: recording.slug,
            title: recording.title,
            speaker: recording.speaker,
            date: recording.date,
            thumbnail: recording.thumbnail,
            featureHeroThumbnail: recording.featureHeroThumbnail,
            description: recording.description,
            tags: recording.tags,
            location: recording.location,
            episodeId: recording.episodeId,
            episode: recording.episode,
            episodeNumber: recording.episodeNumber,
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
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
    country: tCommon("country"),
  };
  return {
    title: t("libraryTitle", commonValues),
    description: t("libraryDescription"),
    openGraph: {
      title: t("libraryTitle", commonValues),
      description: t("libraryDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("libraryTitle", commonValues),
      description: t("libraryDescription"),
    },
  };
}
