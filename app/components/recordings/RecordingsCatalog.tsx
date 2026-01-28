"use client";

import type { LibraryApiPayload, LibraryPayload } from "@/lib/recordings/library-filter";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useDeferredValue, useEffect, useRef, useState } from "react";

import { InfoIcon } from "@/components/shared/icons";
import { Skeleton } from "@/components/shared/Skeletons";
import { Button } from "@/components/ui/Button";
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
  type HiddenGemRecording,
  type HotRecording,
  type LocationFilter,
  type MemberPickRecording,
  UNRECORDED_EPISODES,
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
  initialPayload,
  memberPicks,
  hotPicks,
  hiddenGems,
  scrollLeftLabel,
  scrollRightLabel,
  previousFeaturedLabel,
  nextFeaturedLabel,
  trendingSlots,
}: {
  initialPayload: LibraryPayload;
  memberPicks?: MemberPickRecording[];
  hotPicks?: HotRecording[];
  hiddenGems?: HiddenGemRecording[];
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
  const tCommon = useTranslations("common");
  const tLibrary = useTranslations("libraryPage");
  const tView = useTranslations("libraryPage.view");
  const locale = useLocale();
  const router = useRouter();
  const [payload, setPayload] = useState<LibraryPayload>(initialPayload);
  const [localSearchQuery, setLocalSearchQuery] = useState(initialPayload.searchQuery);
  const deferredSearchQuery = useDeferredValue(payload.searchQuery);
  const [isFiltering, setIsFiltering] = useState(false);
  const isFirstFilter = useRef(true);
  const searchDebounceRef = useRef<number | null>(null);
  const lastCommittedSearchRef = useRef(initialPayload.searchQuery);
  const [canHover, setCanHover] = useState(false);
  const [localViewMode, setLocalViewMode] = useState<"rows" | "grid">(initialPayload.viewMode);
  const { activeLocation } = payload;
  const { activeTag } = payload;
  const { activeEpisode } = payload;
  const { recordings } = payload;

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  useEffect(() => {
    setLocalSearchQuery(payload.searchQuery);
    lastCommittedSearchRef.current = payload.searchQuery;
  }, [payload.searchQuery]);

  useEffect(() => {
    setLocalViewMode(payload.viewMode);
  }, [payload.viewMode]);

  const buildParams = useCallback(
    (
      location: LocationFilter,
      tag: string,
      episode: string,
      search: string,
      view?: "rows" | "grid",
      includeView = true,
    ) => {
      const params = new URLSearchParams();

      if (location !== "all") {
        params.set("location", location);
      }

      if (tag !== "all") {
        params.set("tag", tag);
      }

      if (episode !== "all") {
        params.set("episode", episode);
      }

      if (search.trim()) {
        params.set("q", search.trim());
      }

      if (includeView && (view === "rows" || view === "grid")) {
        params.set("view", view);
      }

      return params;
    },
    [],
  );

  const fetchPayload = useCallback(async (params: URLSearchParams) => {
    setIsFiltering(true);
    try {
      const response = await fetch(`/api/v1/library?${params.toString()}`);
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as LibraryApiPayload;
      setPayload((prev) => ({
        ...prev,
        recordings: data.recordings,
        activeLocation: data.filter.activeLocation,
        activeTag: data.filter.activeTag,
        activeEpisode: data.filter.activeEpisode,
        searchQuery: data.filter.searchQuery,
        tagDropdownOptions: data.filter.tagDropdownOptions,
        episodeDropdownOptions: data.filter.episodeDropdownOptions,
        episodeDropdownGroups: data.filter.episodeDropdownGroups,
        locationAvailability: data.filter.locationAvailability,
      }));
    } finally {
      setIsFiltering(false);
    }
  }, []);

  const updateFilters = useCallback(
    (
      location: LocationFilter,
      tag: string,
      episode: string,
      search = "",
      viewOverride?: "rows" | "grid",
    ) => {
      const trimmedSearch = search.trim();
      const hasFilters =
        location !== "all" || tag !== "all" || episode !== "all" || trimmedSearch !== "";
      const nextView = viewOverride ?? (hasFilters ? "grid" : "rows");
      setLocalViewMode(nextView);
      lastCommittedSearchRef.current = trimmedSearch;

      const params = buildParams(location, tag, episode, trimmedSearch, nextView);
      const apiParams = buildParams(location, tag, episode, trimmedSearch, nextView, false);

      if (typeof window !== "undefined") {
        const nextUrl = params.toString()
          ? `${PAGE_ROUTES.LIBRARY}?${params.toString()}`
          : PAGE_ROUTES.LIBRARY;
        window.history.replaceState(null, "", nextUrl);
      }

      fetchPayload(apiParams);
    },
    [buildParams, fetchPayload],
  );

  const filterKey = `${activeLocation}-${activeTag}-${activeEpisode}-${deferredSearchQuery}`;

  useEffect(() => {
    if (isFirstFilter.current) {
      isFirstFilter.current = false;
      return;
    }

    const timer = setTimeout(() => setIsFiltering(false), 200);
    setIsFiltering(true);

    return () => clearTimeout(timer);
  }, [filterKey]);

  useEffect(() => {
    const trimmed = localSearchQuery.trim();
    if (trimmed === lastCommittedSearchRef.current) {
      return;
    }

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = window.setTimeout(() => {
      updateFilters(activeLocation, activeTag, activeEpisode, trimmed);
    }, 350);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, [localSearchQuery, activeLocation, activeTag, activeEpisode, updateFilters]);

  const handleBrowseAll = () => {
    updateFilters("all", "all", "all", "", "grid");
    window.scrollTo({ behavior: "instant" as ScrollBehavior, left: 0, top: 0 });
  };

  const featuredCandidates = recordings?.slice(0, 5) ?? [];
  const featured = featuredCandidates[0];
  const gridRecordings = recordings ?? [];

  const handleLocationChange = useCallback(
    (location: LocationFilter) =>
      updateFilters(location, activeTag, activeEpisode, localSearchQuery),
    [updateFilters, activeTag, activeEpisode, localSearchQuery],
  );

  const handleTagChange = useCallback(
    (tag: string) => updateFilters(activeLocation, tag, activeEpisode, localSearchQuery),
    [updateFilters, activeLocation, activeEpisode, localSearchQuery],
  );

  const handleEpisodeChange = useCallback(
    (episode: string) => updateFilters(activeLocation, activeTag, episode, localSearchQuery),
    [updateFilters, activeLocation, activeTag, localSearchQuery],
  );

  const handleReset = useCallback(
    () => updateFilters("all", "all", "all", "", "grid"),
    [updateFilters],
  );

  const handleViewRows = useCallback(() => {
    if (typeof window !== "undefined") {
      window.location.assign(PAGE_ROUTES.LIBRARY);
    } else {
      router.push(PAGE_ROUTES.LIBRARY);
    }
  }, [router]);

  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-2 sm:mb-6" />

        {localViewMode === "grid" && (
          <GridFiltersBar
            activeLocation={activeLocation}
            activeTag={activeTag}
            activeEpisode={activeEpisode}
            searchQuery={localSearchQuery}
            tagDropdownOptions={payload.tagDropdownOptions}
            episodeDropdownOptions={payload.episodeDropdownOptions}
            episodeDropdownGroups={payload.episodeDropdownGroups}
            locationAvailability={payload.locationAvailability}
            onLocationChange={handleLocationChange}
            onTagChange={handleTagChange}
            onEpisodeChange={handleEpisodeChange}
            onSearchChange={setLocalSearchQuery}
            onReset={handleReset}
            onViewRows={handleViewRows}
          />
        )}

        {localViewMode === "grid" && <div className="section-divider mb-8" />}

        <div
          className={`min-h-[700px] transition-opacity duration-300 ${
            isFiltering ? "opacity-70" : "opacity-100"
          }`}
        >
          {recordings.length === 0 ? (
            <EmptyStateMessage
              activeEpisode={activeEpisode}
              onReset={() => updateFilters("all", "all", "all", "")}
            />
          ) : (
            <>
              {localViewMode === "rows" && featured && (
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

              {localViewMode === "rows" ? (
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
                          title={payload.rowsLabels.memberPicks}
                          recordings={memberPicks}
                          scrollLeftLabel={scrollLeftLabel}
                          scrollRightLabel={scrollRightLabel}
                        />
                      ))}
                    {trendingSlots?.hotPicks ??
                      (hotPicks && hotPicks.length > 0 && (
                        <HotPicksRail
                          title={payload.rowsLabels.hot}
                          recordings={hotPicks}
                          scrollLeftLabel={scrollLeftLabel}
                          scrollRightLabel={scrollRightLabel}
                        />
                      ))}
                    {trendingSlots?.hiddenGems ??
                      (hiddenGems && hiddenGems.length > 0 && (
                        <HiddenGemsRail
                          title={payload.rowsLabels.hiddenGems}
                          recordings={hiddenGems}
                          scrollLeftLabel={scrollLeftLabel}
                          scrollRightLabel={scrollRightLabel}
                        />
                      ))}
                    {payload.rows.map((row) => (
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
