"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { InfoIcon } from "@/components/shared/icons";
import { Skeleton } from "@/components/shared/Skeletons";
import { Button } from "@/components/ui/Button";
import { LOCATIONS } from "@/lib/config/constants";
import { getEpisodeById } from "@/lib/recordings/episodes";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { EmptyStateMessage } from "./EmptyStateMessage";
import { FeaturedRecording } from "./FeaturedRecording";
import { GridFiltersBar } from "./GridFiltersBar";
import { GridView } from "./GridView";
import { HiddenGemsRail } from "./HiddenGemsRail";
import { HotPicksRail } from "./HotPicksRail";
import { MemberPicksRail } from "./MemberPicksRail";
import { RecordingRail } from "./RecordingRail";
import {
  type CatalogRecording,
  type HiddenGemRecording,
  type HotRecording,
  type LocationFilter,
  type MemberPickRecording,
  UNRECORDED_EPISODES,
  normalizeText,
} from "./RecordingsCatalogTypes";

function RailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-5 overflow-hidden pt-1 pb-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={`rail-skeleton-${index}`}
            className="w-[75vw] shrink-0 sm:w-[45vw] lg:w-[280px] xl:w-[300px]"
          >
            <Skeleton className="aspect-video w-full !rounded-none" />
            <div className="space-y-3 bg-white/85 px-4 pt-4 pb-5 dark:bg-black/75">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={`grid-skeleton-${index}`} className="overflow-hidden rounded-[28px]">
          <Skeleton className="aspect-video w-full !rounded-none" />
          <div className="space-y-3 bg-white/85 px-5 pt-5 pb-6 dark:bg-black/75">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BrowseAllButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="primary"
      size="xs"
      className="from-brand-500 shadow-brand-500/20 rounded-full bg-gradient-to-r to-rose-500 text-white shadow-lg"
    >
      {label}
    </Button>
  );
}

export function RecordingsCatalog({
  recordings,
  memberPicks,
  hotPicks,
  hiddenGems,
  initialFilters,
  preFilteredRecordings,
  scrollLeftLabel,
  scrollRightLabel,
  previousFeaturedLabel,
  nextFeaturedLabel,
  trendingSlots,
}: {
  recordings: CatalogRecording[];
  memberPicks?: MemberPickRecording[];
  hotPicks?: HotRecording[];
  hiddenGems?: HiddenGemRecording[];
  initialFilters?: {
    location: LocationFilter;
    tag: string;
    episode: string;
    searchQuery: string;
    viewMode: "rows" | "grid";
  };
  preFilteredRecordings?: CatalogRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
  previousFeaturedLabel?: string;
  nextFeaturedLabel?: string;
  trendingSlots?: {
    memberPicks?: React.ReactNode;
    hotPicks?: React.ReactNode;
    hiddenGems?: React.ReactNode;
  };
}) {
  const t = useTranslations("recordings");
  const tCommon = useTranslations("common");
  const tLibrary = useTranslations("libraryPage");
  const tFilters = useTranslations("libraryPage.filters");
  const tRows = useTranslations("libraryPage.rows");
  const tView = useTranslations("libraryPage.view");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deferredSearchParams = useDeferredValue(searchParams);
  const [activeLocation, setActiveLocation] = useState<LocationFilter>(
    initialFilters?.location ?? "all",
  );
  const [activeTag, setActiveTag] = useState(initialFilters?.tag ?? "all");
  const [activeEpisode, setActiveEpisode] = useState(initialFilters?.episode ?? "all");
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery ?? "");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isFiltering, setIsFiltering] = useState(false);
  const isFirstFilter = useRef(true);
  const searchDebounceRef = useRef<number | null>(null);
  const isSearchDirtyRef = useRef(false);
  const lastCommittedSearchRef = useRef(initialFilters?.searchQuery ?? "");
  const activeLocationRef = useRef(initialFilters?.location ?? "all");
  const activeTagRef = useRef(initialFilters?.tag ?? "all");
  const activeEpisodeRef = useRef(initialFilters?.episode ?? "all");
  const pendingUpdateRef = useRef<string | null>(null);
  const [viewMode, setViewMode] = useState<"rows" | "grid">(initialFilters?.viewMode ?? "rows");
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  const tagOptions = useMemo(() => {
    const filteredForTags = recordings.filter(
      (r) =>
        (activeLocation === "all" || r.location === activeLocation) &&
        (activeEpisode === "all" || r.episodeId === activeEpisode),
    );
    const tags = Array.from(new Set(filteredForTags.flatMap((recording) => recording.tags))).sort(
      (a, b) => a.localeCompare(b),
    );

    return ["all", ...tags];
  }, [recordings, activeLocation, activeEpisode]);

  const episodeOptions = useMemo(() => {
    const filteredForEpisodes = recordings.filter(
      (r) =>
        (activeLocation === "all" || r.location === activeLocation) &&
        (activeTag === "all" || r.tags.includes(activeTag)),
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
  }, [recordings, activeLocation, activeTag, t]);

  const groupedEpisodes = useMemo(() => {
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
  }, [episodeOptions, tFilters, tCommon]);

  const tagDropdownOptions = useMemo(
    () =>
      tagOptions.map((tag) => ({
        label: tag === "all" ? tFilters("allTags") : tag,
        value: tag,
      })),
    [tFilters, tagOptions],
  );

  const episodeDropdownOptions = useMemo(
    () => [{ label: tFilters("allEpisodes"), value: "all" }],
    [tFilters],
  );

  const episodeDropdownGroups = useMemo(
    () =>
      groupedEpisodes.map((group) => ({
        label: group.label,
        options: group.options.map((option) => ({
          label: option.label,
          value: option.value,
        })),
      })),
    [groupedEpisodes],
  );

  useEffect(() => {
    if (isSearchDirtyRef.current) {
      return;
    }

    const currentUrl = deferredSearchParams.toString();

    if (pendingUpdateRef.current === currentUrl) {
      pendingUpdateRef.current = null;
      isSearchDirtyRef.current = false;
      return;
    }

    const locationParam = deferredSearchParams.get("location") ?? "all";
    const tagParam = deferredSearchParams.get("tag") ?? "all";
    const episodeParam = deferredSearchParams.get("episode") ?? "all";
    const queryParam = deferredSearchParams.get("q") ?? "";
    const isPragueLocation = locationParam === LOCATIONS.PRAGUE;
    const isZlinLocation = locationParam === LOCATIONS.ZLIN;
    const isValidLocation = isPragueLocation || isZlinLocation;
    const normalizedLocation = isValidLocation ? locationParam : "all";

    const isTagValid = tagOptions.includes(tagParam);
    const normalizedTag = isTagValid ? tagParam : "all";

    const isEpisodeInOptions = episodeOptions.some((option) => option.value === episodeParam);
    const isUnrecordedEpisode = UNRECORDED_EPISODES.has(episodeParam);
    const isValidEpisode = isEpisodeInOptions || isUnrecordedEpisode;
    const normalizedEpisode = isValidEpisode ? episodeParam : "all";
    const normalizedQuery = queryParam.trim();

    const hasInitialFilters = Boolean(initialFilters);
    const isLocationMatch = normalizedLocation === initialFilters?.location;
    const isTagMatch = normalizedTag === initialFilters?.tag;
    const isEpisodeMatch = normalizedEpisode === initialFilters?.episode;
    const isQueryMatch = normalizedQuery === initialFilters?.searchQuery.trim();
    const matchesInitialState =
      hasInitialFilters && isLocationMatch && isTagMatch && isEpisodeMatch && isQueryMatch;

    if (matchesInitialState) {
      return;
    }

    if (normalizedLocation !== activeLocationRef.current) {
      setActiveLocation(normalizedLocation);
      activeLocationRef.current = normalizedLocation;
    }

    if (normalizedTag !== activeTagRef.current) {
      setActiveTag(normalizedTag);
      activeTagRef.current = normalizedTag;
    }

    if (normalizedEpisode !== activeEpisodeRef.current) {
      setActiveEpisode(normalizedEpisode);
      activeEpisodeRef.current = normalizedEpisode;
    }
    const isSearchNotDirty = !isSearchDirtyRef.current;
    const isQueryUnchanged = normalizedQuery === lastCommittedSearchRef.current;
    const shouldUpdateSearch = isSearchNotDirty || isQueryUnchanged;

    if (shouldUpdateSearch) {
      setSearchQuery(normalizedQuery);
      lastCommittedSearchRef.current = normalizedQuery;
      isSearchDirtyRef.current = false;
    }
  }, [deferredSearchParams, tagOptions, episodeOptions, initialFilters, searchQuery]);

  const updateFilters = useCallback(
    (
      location: LocationFilter,
      tag: string,
      episode: string,
      search = "",
      options?: { updateMode?: "router" | "history" },
    ) => {
      const trimmedSearch = search.trim();
      lastCommittedSearchRef.current = trimmedSearch;
      activeLocationRef.current = location;
      activeTagRef.current = tag;
      activeEpisodeRef.current = episode;
      const params = new URLSearchParams();

      if (location === "all") {
        params.delete("location");
      } else {
        params.set("location", location);
      }

      if (tag === "all") {
        params.delete("tag");
      } else {
        params.set("tag", tag);
      }

      if (episode === "all") {
        params.delete("episode");
      } else {
        params.set("episode", episode);
      }

      if (!trimmedSearch) {
        params.delete("q");
      } else {
        params.set("q", trimmedSearch);
      }

      const queryString = params.toString();
      const nextUrl = queryString ? `${PAGE_ROUTES.LIBRARY}?${queryString}` : PAGE_ROUTES.LIBRARY;

      if (options?.updateMode === "history") {
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", nextUrl);
        }
        pendingUpdateRef.current = null;
        isSearchDirtyRef.current = false;
        return;
      }

      pendingUpdateRef.current = queryString;
      startTransition(() => {
        router.replace(nextUrl);
      });
    },
    [router],
  );

  const filteredRecordings = useMemo(() => {
    const hasInitialFilters = Boolean(initialFilters);
    const isLocationUnchanged = activeLocation === initialFilters?.location;
    const isTagUnchanged = activeTag === initialFilters?.tag;
    const isEpisodeUnchanged = activeEpisode === initialFilters?.episode;
    const isSearchUnchanged = deferredSearchQuery.trim() === initialFilters?.searchQuery.trim();
    const areFiltersUnchanged =
      hasInitialFilters &&
      isLocationUnchanged &&
      isTagUnchanged &&
      isEpisodeUnchanged &&
      isSearchUnchanged;
    const hasPreFilteredRecordings = Boolean(preFilteredRecordings);

    if (areFiltersUnchanged && hasPreFilteredRecordings && preFilteredRecordings) {
      return preFilteredRecordings;
    }

    const normalizedQuery = normalizeText(deferredSearchQuery.trim());

    return recordings.filter((recording) => {
      const isLocationMatch = activeLocation === "all" || recording.location === activeLocation;
      const isTagMatch = activeTag === "all" || recording.tags.includes(activeTag);
      const isEpisodeMatch = activeEpisode === "all" || recording.episodeId === activeEpisode;

      const isSearchEmpty = normalizedQuery.length === 0;
      const isTitleMatch = normalizeText(recording.title).includes(normalizedQuery);
      const isSpeakerMatch = recording.speaker.some((name: string) =>
        normalizeText(name).includes(normalizedQuery),
      );
      const isTagInSearch = recording.tags.some((tag: string) =>
        normalizeText(tag).includes(normalizedQuery),
      );
      const isLocationInSearch = normalizeText(recording.location).includes(normalizedQuery);
      const hasEpisode = Boolean(recording.episode);
      const isEpisodeInSearch =
        hasEpisode && recording.episode
          ? normalizeText(recording.episode).includes(normalizedQuery)
          : false;
      const hasDescription = Boolean(recording.description);
      const isDescriptionMatch =
        hasDescription && recording.description
          ? normalizeText(recording.description).includes(normalizedQuery)
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
  }, [
    recordings,
    activeLocation,
    activeTag,
    activeEpisode,
    deferredSearchQuery,
    initialFilters,
    preFilteredRecordings,
  ]);

  const filterKey = `${activeLocation}-${activeTag}-${activeEpisode}-${deferredSearchQuery}`;
  const isLocationFiltered = activeLocation !== "all";
  const isTagFiltered = activeTag !== "all";
  const isEpisodeFiltered = activeEpisode !== "all";
  const isSearchFiltered = deferredSearchQuery.trim() !== "";
  const hasActiveFilters =
    isLocationFiltered || isTagFiltered || isEpisodeFiltered || isSearchFiltered;

  useEffect(() => {
    if (isFirstFilter.current) {
      isFirstFilter.current = false;

      return;
    }

    setIsFiltering(true);
    const timer = setTimeout(() => setIsFiltering(false), 200);

    return () => clearTimeout(timer);
  }, [filterKey]);

  useEffect(() => {
    if (hasActiveFilters) {
      setViewMode("grid");
    }
  }, [hasActiveFilters]);

  useEffect(() => {
    if (isSearchDirtyRef.current) {
      const trimmed = searchQuery.trim();
      const currentQueryParam = searchParams.get("q") ?? "";

      if (trimmed === currentQueryParam) {
        return;
      }

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      searchDebounceRef.current = window.setTimeout(() => {
        updateFilters(activeLocation, activeTag, activeEpisode, trimmed, { updateMode: "history" });
      }, 350);

      return () => {
        if (searchDebounceRef.current) {
          clearTimeout(searchDebounceRef.current);
        }
      };
    }
  }, [searchQuery, activeLocation, activeTag, activeEpisode, searchParams, updateFilters]);

  const handleBrowseAll = () => {
    setViewMode("grid");
    window.scrollTo({ behavior: "instant" as ScrollBehavior, left: 0, top: 0 });
  };

  interface RailRow {
    key: string;
    title: string;
    items: CatalogRecording[];
  }

  const featuredCandidates = filteredRecordings?.slice(0, 5) ?? [];
  const featured = featuredCandidates[0];
  const gridRecordings = filteredRecordings ?? [];

  const latestRecordings = useMemo(() => filteredRecordings.slice(0, 12), [filteredRecordings]);

  const locationRows = useMemo(() => {
    const rows: RailRow[] = [];
    const pragueItems = filteredRecordings.filter((r) => r.location === LOCATIONS.PRAGUE);
    const zlinItems = filteredRecordings.filter((r) => r.location === LOCATIONS.ZLIN);

    if (activeLocation === "all") {
      if (pragueItems.length > 0) {
        rows.push({
          items: pragueItems,
          key: "location-prague",
          title: tRows("prague", { prague: tCommon("prague") }),
        });
      }

      if (zlinItems.length > 0) {
        rows.push({
          items: zlinItems,
          key: "location-zlin",
          title: tRows("zlin", { zlin: tCommon("zlin") }),
        });
      }

      return rows;
    }

    if (activeLocation === LOCATIONS.PRAGUE && pragueItems.length > 0) {
      rows.push({
        items: pragueItems,
        key: "location-prague",
        title: tRows("prague", { prague: tCommon("prague") }),
      });
    }

    if (activeLocation === LOCATIONS.ZLIN && zlinItems.length > 0) {
      rows.push({
        items: zlinItems,
        key: "location-zlin",
        title: tRows("zlin", { zlin: tCommon("zlin") }),
      });
    }

    return rows;
  }, [activeLocation, filteredRecordings, tRows, tCommon]);

  const tagRows = useMemo(() => {
    if (activeTag !== "all") {
      return [];
    }

    const counts = new Map<string, number>();
    filteredRecordings.forEach((recording) => {
      recording.tags.forEach((tag: string) => {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      });
    });

    const topTags = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    return topTags
      .map((tag) => ({
        items: filteredRecordings.filter((recording) => recording.tags.includes(tag)),
        key: `tag-${tag}`,
        title: tRows("topic", { tag }),
      }))
      .filter((row) => row.items.length > 0);
  }, [activeTag, filteredRecordings, tRows]);

  const rows = useMemo(() => {
    const nextRows: RailRow[] = [];

    if (latestRecordings.length > 0) {
      nextRows.push({ items: latestRecordings, key: "latest", title: tRows("latest") });
    }

    return [...nextRows, ...locationRows, ...tagRows];
  }, [latestRecordings, locationRows, tagRows, tRows]);

  const handleLocationChange = useCallback(
    (location: LocationFilter) => updateFilters(location, activeTag, activeEpisode, searchQuery),
    [updateFilters, activeTag, activeEpisode, searchQuery],
  );

  const handleTagChange = useCallback(
    (tag: string) => updateFilters(activeLocation, tag, activeEpisode, searchQuery),
    [updateFilters, activeLocation, activeEpisode, searchQuery],
  );

  const handleEpisodeChange = useCallback(
    (episode: string) => updateFilters(activeLocation, activeTag, episode, searchQuery),
    [updateFilters, activeLocation, activeTag, searchQuery],
  );

  const handleReset = useCallback(() => updateFilters("all", "all", "all", ""), [updateFilters]);

  const handleViewRows = useCallback(() => {
    setViewMode("rows");
    updateFilters("all", "all", "all", "");
  }, [updateFilters]);

  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-2 sm:mb-6" />

        {viewMode === "grid" && (
          <GridFiltersBar
            recordings={recordings}
            activeLocation={activeLocation}
            activeTag={activeTag}
            activeEpisode={activeEpisode}
            searchQuery={searchQuery}
            tagDropdownOptions={tagDropdownOptions}
            episodeDropdownOptions={episodeDropdownOptions}
            episodeDropdownGroups={episodeDropdownGroups}
            onLocationChange={handleLocationChange}
            onTagChange={handleTagChange}
            onEpisodeChange={handleEpisodeChange}
            onSearchChange={setSearchQuery}
            onReset={handleReset}
            onViewRows={handleViewRows}
            isSearchDirtyRef={isSearchDirtyRef}
          />
        )}

        {viewMode === "grid" && <div className="section-divider mb-8" />}

        <div
          className={`min-h-[700px] transition-opacity duration-300 ${
            isFiltering ? "opacity-70" : "opacity-100"
          }`}
        >
          {filteredRecordings.length === 0 ? (
            <EmptyStateMessage
              activeEpisode={activeEpisode}
              onReset={() => updateFilters("all", "all", "all", "")}
            />
          ) : (
            <>
              {viewMode === "rows" && featured && (
                <>
                  <FeaturedRecording
                    featured={featured}
                    candidates={featuredCandidates}
                    locale={locale}
                    filterKey={filterKey}
                    canHover={canHover}
                    onNavigate={(slug, shortId) => router.push(PAGE_ROUTES.WATCH(slug, shortId))}
                    previousLabel={previousFeaturedLabel}
                    nextLabel={nextFeaturedLabel}
                  />
                  <div className="section-divider mb-10" />
                </>
              )}

              {viewMode === "rows" ? (
                isFiltering ? (
                  <div className="space-y-12">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <RailSkeleton key={`filter-rail-skeleton-${index}`} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="flex justify-center">
                      <BrowseAllButton label={tView("all")} onClick={handleBrowseAll} />
                    </div>
                    {trendingSlots?.memberPicks ??
                      (memberPicks && memberPicks.length > 0 && (
                        <MemberPicksRail
                          title={tRows("memberPicks")}
                          recordings={memberPicks}
                          scrollLeftLabel={scrollLeftLabel}
                          scrollRightLabel={scrollRightLabel}
                        />
                      ))}
                    {trendingSlots?.hotPicks ??
                      (hotPicks && hotPicks.length > 0 && (
                        <HotPicksRail
                          title={tRows("hot")}
                          recordings={hotPicks}
                          scrollLeftLabel={scrollLeftLabel}
                          scrollRightLabel={scrollRightLabel}
                        />
                      ))}
                    {trendingSlots?.hiddenGems ??
                      (hiddenGems && hiddenGems.length > 0 && (
                        <HiddenGemsRail
                          title={tRows("hiddenGems")}
                          recordings={hiddenGems}
                          scrollLeftLabel={scrollLeftLabel}
                          scrollRightLabel={scrollRightLabel}
                        />
                      ))}
                    {rows.map((row) => (
                      <RecordingRail
                        key={`${row.key}-${filterKey}`}
                        title={row.title}
                        recordings={row.items}
                        scrollLeftLabel={scrollLeftLabel}
                        scrollRightLabel={scrollRightLabel}
                      />
                    ))}
                    <div className="flex justify-center">
                      <BrowseAllButton label={tView("all")} onClick={handleBrowseAll} />
                    </div>
                  </div>
                )
              ) : isFiltering ? (
                <GridSkeleton />
              ) : (
                <GridView recordings={gridRecordings} locale={locale} filterKey={filterKey} />
              )}
            </>
          )}
        </div>

        {!UNRECORDED_EPISODES.has(activeEpisode) && (
          <div className="mt-20 flex justify-center">
            <div className="glass-card no-hover-pop relative inline-flex items-center gap-4 px-6 py-4">
              <div className="bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-400 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <InfoIcon className="h-5 w-5" />
              </div>
              <p className="max-w-4xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                <span className="mr-1.5 font-semibold text-neutral-900 dark:text-white">
                  {tLibrary("noteLabel")}
                </span>
                {tLibrary("disclaimer", { prague: tCommon("prague") })}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
