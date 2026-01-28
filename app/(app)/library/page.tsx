import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { RecordingsCatalog } from "@/components/recordings/RecordingsCatalog";
import {
  UNRECORDED_EPISODES,
  type CatalogRecording,
} from "@/components/recordings/RecordingsCatalogTypes";
import {
  HiddenGemsRailServer,
  HotPicksRailServer,
  MemberPicksRailServer,
} from "@/components/recordings/TrendingRailsServer";
import { TrendingRailSkeleton } from "@/components/shared/Skeletons";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getEpisodeById } from "@/lib/recordings/episodes";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { normalizeText } from "@/lib/utils/text";

type LocationFilter = "all" | LocationValue;

interface RailRow {
  key: string;
  title: string;
  items: CatalogRecording[];
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string;
    tag?: string;
    episode?: string;
    q?: string;
    view?: string;
  }>;
}) {
  const tCommon = await getTranslations("common");
  const tFilters = await getTranslations("libraryPage.filters");
  const tRows = await getTranslations("libraryPage.rows");
  const t = await getTranslations("recordings");
  const params = await searchParams;

  const locationParam = params.location;
  const isPragueLocation = locationParam === LOCATIONS.PRAGUE;
  const isZlinLocation = locationParam === LOCATIONS.ZLIN;
  const isValidLocation = isPragueLocation || isZlinLocation;
  const initialLocation: LocationFilter = isValidLocation && locationParam ? locationParam : "all";
  const initialTag = params.tag ?? "all";
  const initialEpisode = params.episode ?? "all";
  const initialSearchQuery = params.q ?? "";
  const viewParam = params.view;
  const normalizedSearchQuery = normalizeText(initialSearchQuery.trim());

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

  const tagOptions = (() => {
    const filteredForTags = recordings.filter(
      (r) =>
        (initialLocation === "all" || r.location === initialLocation) &&
        (initialEpisode === "all" || r.episodeId === initialEpisode),
    );
    const tags = Array.from(new Set(filteredForTags.flatMap((recording) => recording.tags))).sort(
      (a, b) => a.localeCompare(b),
    );

    return ["all", ...tags];
  })();

  const tagDropdownOptions = tagOptions.map((tag) => ({
    label: tag === "all" ? tFilters("allTags") : tag,
    value: tag,
  }));

  const episodeDropdownOptions = [{ label: tFilters("allEpisodes"), value: "all" }];

  const episodeOptions = (() => {
    const filteredForEpisodes = recordings.filter(
      (r) =>
        (initialLocation === "all" || r.location === initialLocation) &&
        (initialTag === "all" || r.tags.includes(initialTag)),
    );
    const map = new Map<
      string,
      { number?: number; location: typeof LOCATIONS.PRAGUE | typeof LOCATIONS.ZLIN; title: string }
    >();
    filteredForEpisodes.forEach((recording) => {
      if (recording.episodeId) {
        const title = recording.episode ?? recording.episodeId;

        if (!map.has(recording.episodeId)) {
          map.set(recording.episodeId, {
            location: recording.location,
            number: recording.episodeNumber,
            title,
          });
        }
      }
    });

    for (const episodeId of UNRECORDED_EPISODES) {
      if (!map.has(episodeId)) {
        const episode = getEpisodeById(episodeId);

        if (episode) {
          map.set(episodeId, {
            location: episode.city === "prague" ? LOCATIONS.PRAGUE : LOCATIONS.ZLIN,
            number: episode.number,
            title: episode.title,
          });
        }
      }
    }

    return Array.from(map.entries()).map(([id, data]) => ({
      label: data.number ? `${t("epShort")} ${data.number} - ${data.title}` : data.title,
      location: data.location,
      number: data.number || 0,
      value: id,
    }));
  })();

  const groupedEpisodes = (() => {
    const prague = episodeOptions
      .filter((e) => e.location === LOCATIONS.PRAGUE)
      .sort((a, b) => b.number - a.number);
    const zlin = episodeOptions
      .filter((e) => e.location === LOCATIONS.ZLIN)
      .sort((a, b) => b.number - a.number);

    return [
      { label: tFilters("prague", { prague: tCommon("prague") }), options: prague },
      { label: tFilters("zlin", { zlin: tCommon("zlin") }), options: zlin },
    ].filter((group) => group.options.length > 0);
  })();

  const episodeDropdownGroups = groupedEpisodes.map((group) => ({
    label: group.label,
    options: group.options.map((option) => ({
      label: option.label,
      value: option.value,
    })),
  }));

  const locationAvailability = {
    all: true,
    [LOCATIONS.PRAGUE]: recordings.some((recording) => {
      const isLocationMatch = recording.location === LOCATIONS.PRAGUE;
      const isTagMatch = initialTag === "all" || recording.tags.includes(initialTag);
      const isEpisodeMatch = initialEpisode === "all" || recording.episodeId === initialEpisode;

      return isLocationMatch && isTagMatch && isEpisodeMatch;
    }),
    [LOCATIONS.ZLIN]: recordings.some((recording) => {
      const isLocationMatch = recording.location === LOCATIONS.ZLIN;
      const isTagMatch = initialTag === "all" || recording.tags.includes(initialTag);
      const isEpisodeMatch = initialEpisode === "all" || recording.episodeId === initialEpisode;

      return isLocationMatch && isTagMatch && isEpisodeMatch;
    }),
  };

  const filteredRecordings = recordings.filter((recording) => {
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

  const rows = (() => {
    const nextRows: RailRow[] = [];
    const latestRecordings = filteredRecordings.slice(0, 12);

    if (latestRecordings.length > 0) {
      nextRows.push({ items: latestRecordings, key: "latest", title: tRows("latest") });
    }

    const pragueItems = filteredRecordings.filter((r) => r.location === LOCATIONS.PRAGUE);
    const zlinItems = filteredRecordings.filter((r) => r.location === LOCATIONS.ZLIN);

    if (initialLocation === "all") {
      if (pragueItems.length > 0) {
        nextRows.push({
          items: pragueItems,
          key: "location-prague",
          title: tRows("prague", { prague: tCommon("prague") }),
        });
      }

      if (zlinItems.length > 0) {
        nextRows.push({
          items: zlinItems,
          key: "location-zlin",
          title: tRows("zlin", { zlin: tCommon("zlin") }),
        });
      }
    } else if (initialLocation === LOCATIONS.PRAGUE && pragueItems.length > 0) {
      nextRows.push({
        items: pragueItems,
        key: "location-prague",
        title: tRows("prague", { prague: tCommon("prague") }),
      });
    } else if (initialLocation === LOCATIONS.ZLIN && zlinItems.length > 0) {
      nextRows.push({
        items: zlinItems,
        key: "location-zlin",
        title: tRows("zlin", { zlin: tCommon("zlin") }),
      });
    }

    if (initialTag === "all") {
      const counts = new Map<string, number>();
      filteredRecordings.forEach((recording) => {
        recording.tags.forEach((tag) => {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        });
      });

      const topTags = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([tag]) => tag);

      topTags.forEach((tag) => {
        const items = filteredRecordings.filter((recording) => recording.tags.includes(tag));
        if (items.length > 0) {
          nextRows.push({
            items,
            key: `tag-${tag}`,
            title: tRows("topic", { tag }),
          });
        }
      });
    }

    return nextRows;
  })();

  const isLocationFiltered = initialLocation !== "all";
  const isTagFiltered = initialTag !== "all";
  const isEpisodeFiltered = initialEpisode !== "all";
  const isSearchFiltered = initialSearchQuery.trim() !== "";
  const hasActiveFilters =
    isLocationFiltered || isTagFiltered || isEpisodeFiltered || isSearchFiltered;
  const initialViewMode: "rows" | "grid" =
    viewParam === "rows" || viewParam === "grid" ? viewParam : hasActiveFilters ? "grid" : "rows";

  const scrollLeftLabel = tCommon("scrollLeft");
  const scrollRightLabel = tCommon("scrollRight");

  return (
    <main className="gradient-bg min-h-screen pt-24">
      <RecordingsCatalog
        recordings={filteredRecordings}
        activeEpisode={initialEpisode}
        activeLocation={initialLocation}
        activeTag={initialTag}
        searchQuery={initialSearchQuery}
        viewMode={initialViewMode}
        tagDropdownOptions={tagDropdownOptions}
        episodeDropdownOptions={episodeDropdownOptions}
        episodeDropdownGroups={episodeDropdownGroups}
        locationAvailability={locationAvailability}
        rows={rows}
        rowsLabels={{
          memberPicks: tRows("memberPicks"),
          hot: tRows("hot"),
          hiddenGems: tRows("hiddenGems"),
        }}
        scrollLeftLabel={scrollLeftLabel}
        scrollRightLabel={scrollRightLabel}
        previousFeaturedLabel={tCommon("previousFeatured")}
        nextFeaturedLabel={tCommon("nextFeatured")}
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
