"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useDeferredValue, useEffect, useRef, useState } from "react";

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
  type CatalogRecording,
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
  recordings,
  memberPicks,
  hotPicks,
  hiddenGems,
  activeLocation,
  activeTag,
  activeEpisode,
  searchQuery,
  viewMode,
  tagDropdownOptions,
  episodeDropdownOptions,
  episodeDropdownGroups,
  locationAvailability,
  rows,
  rowsLabels,
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
  activeLocation: LocationFilter;
  activeTag: string;
  activeEpisode: string;
  searchQuery: string;
  viewMode: "rows" | "grid";
  tagDropdownOptions: { label: string; value: string }[];
  episodeDropdownOptions: { label: string; value: string }[];
  episodeDropdownGroups: { label: string; options: { label: string; value: string }[] }[];
  locationAvailability: Record<LocationFilter, boolean>;
  rows: { key: string; title: string; items: CatalogRecording[] }[];
  rowsLabels: {
    memberPicks: string;
    hot: string;
    hiddenGems: string;
  };
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
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [isFiltering, setIsFiltering] = useState(false);
  const isFirstFilter = useRef(true);
  const searchDebounceRef = useRef<number | null>(null);
  const lastCommittedSearchRef = useRef(searchQuery);
  const [canHover, setCanHover] = useState(false);
  const [localViewMode, setLocalViewMode] = useState<"rows" | "grid">(viewMode);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
    lastCommittedSearchRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    setLocalViewMode(viewMode);
  }, [viewMode]);

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

      if (viewOverride === "rows" && !hasFilters) {
        params.delete("view");
      } else if (viewOverride) {
        params.set("view", viewOverride);
      } else {
        params.delete("view");
      }

      const queryString = params.toString();
      const nextUrl = queryString ? `${PAGE_ROUTES.LIBRARY}?${queryString}` : PAGE_ROUTES.LIBRARY;

      startTransition(() => {
        router.replace(nextUrl);
      });
    },
    [router],
  );

  const filterKey = `${activeLocation}-${activeTag}-${activeEpisode}-${deferredSearchQuery}`;

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
    updateFilters("all", "all", "all", "", "rows");
  }, [updateFilters]);

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
            tagDropdownOptions={tagDropdownOptions}
            episodeDropdownOptions={episodeDropdownOptions}
            episodeDropdownGroups={episodeDropdownGroups}
            locationAvailability={locationAvailability}
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
                          title={rowsLabels.memberPicks}
                          recordings={memberPicks}
                          scrollLeftLabel={scrollLeftLabel}
                          scrollRightLabel={scrollRightLabel}
                        />
                      ))}
                    {trendingSlots?.hotPicks ??
                      (hotPicks && hotPicks.length > 0 && (
                        <HotPicksRail
                          title={rowsLabels.hot}
                          recordings={hotPicks}
                          scrollLeftLabel={scrollLeftLabel}
                          scrollRightLabel={scrollRightLabel}
                        />
                      ))}
                    {trendingSlots?.hiddenGems ??
                      (hiddenGems && hiddenGems.length > 0 && (
                        <HiddenGemsRail
                          title={rowsLabels.hiddenGems}
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
