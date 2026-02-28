"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useDeferredValue, useEffect, useRef, useState } from "react";

import { InfoIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import {
  type HiddenGemRecording,
  type HotRecording,
  type LocationFilter,
  type MemberPickRecording,
  UNRECORDED_EPISODES,
} from "@/lib/recordings/catalog-types";
import { getRecordingAccessState } from "@/lib/recordings/early-access";
import { getFeaturedCandidates } from "@/lib/recordings/library-featured";
import {
  LIBRARY_SHELVES,
  type LibraryApiPayload,
  type LibraryRowsPayload,
} from "@/lib/recordings/library-filter";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { logError } from "@/lib/utils/log-client";

import { EarlyAccessRail } from "./EarlyAccessRail";
import { EmptyStateMessage } from "./EmptyStateMessage";
import { FeaturedRecording } from "./FeaturedRecording";
import { GridFiltersBar } from "./GridFiltersBar";
import { GridView } from "./GridView";
import { GuildVaultRail } from "./GuildVaultRail";
import { HiddenGemsRail } from "./HiddenGemsRail";
import { HotPicksRail } from "./HotPicksRail";
import { buildLibrarySearchParams, fetchLibraryApiPayload } from "./library-client-utils";
import { MemberPicksRail } from "./MemberPicksRail";
import { RecordingsGridSkeleton, RecordingsRailSkeleton } from "./RecordingLoadingSkeletons";
import { RecordingRail } from "./RecordingRail";

function BrowseAllVideosButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      size="xs"
      className="rounded-full border border-black/10 bg-white/70 text-neutral-700 shadow-sm hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-neutral-200 dark:hover:bg-white/10"
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
  trendingSlots,
}: {
  initialPayload: LibraryRowsPayload;
  memberPicks?: MemberPickRecording[];
  hotPicks?: HotRecording[];
  hiddenGems?: HiddenGemRecording[];
  trendingSlots?: {
    memberPicks?: React.ReactNode;
    hotPicks?: React.ReactNode;
    hiddenGems?: React.ReactNode;
  };
}) {
  const tCommon = useTranslations("common");
  const tLibrary = useTranslations("libraryPage");
  const tRows = useTranslations("libraryPage.rows");
  const tView = useTranslations("libraryPage.view");
  const locale = useLocale();
  const router = useRouter();
  const [payload, setPayload] = useState<LibraryRowsPayload>(initialPayload);
  const [localSearchQuery, setLocalSearchQuery] = useState(initialPayload.searchQuery);
  const deferredSearchQuery = useDeferredValue(payload.searchQuery);
  const [isFiltering, setIsFiltering] = useState(false);
  const searchDebounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const activeRequestRef = useRef<AbortController | null>(null);
  const lastCommittedSearchRef = useRef(initialPayload.searchQuery);
  const [canHover, setCanHover] = useState(false);
  const [localViewMode, setLocalViewMode] = useState<"rows" | "grid">("rows");
  const { activeLocation } = payload;
  const { activeTag } = payload;
  const { activeEpisode } = payload;
  const { recordings } = payload;

  useEffect(() => {
    setPayload(initialPayload);
    setLocalViewMode("rows");
    setLocalSearchQuery(initialPayload.searchQuery);
    lastCommittedSearchRef.current = initialPayload.searchQuery;
  }, [initialPayload]);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover)");
    const handleChange = () => setCanHover(media.matches);
    handleChange();

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => media.removeEventListener("change", handleChange);
    }

    media.addListener(handleChange);
    return () => media.removeListener(handleChange);
  }, []);

  useEffect(() => {
    setLocalSearchQuery(payload.searchQuery);
    lastCommittedSearchRef.current = payload.searchQuery;
  }, [payload.searchQuery]);

  useEffect(() => {
    router.prefetch(PAGE_ROUTES.LIBRARY_BROWSE);
  }, [router]);

  const fetchPayload = useCallback(async (params: URLSearchParams) => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }
    const controller = new AbortController();
    activeRequestRef.current = controller;

    setIsFiltering(true);
    try {
      const result = await fetchLibraryApiPayload(params, controller.signal);
      if (!result.data) {
        return;
      }
      const data = result.data as LibraryApiPayload;
      if (requestId !== requestIdRef.current || controller.signal.aborted) {
        return;
      }
      setPayload((prev) => ({
        ...prev,
        recordings: data.recordings,
        featuredShortIdOrder: data.filter.featuredShortIdOrder,
        activeLocation: data.filter.activeLocation,
        activeTag: data.filter.activeTag,
        activeEpisode: data.filter.activeEpisode,
        activeShelf: data.filter.activeShelf,
        searchQuery: data.filter.searchQuery,
        tagDropdownOptions: data.filter.tagDropdownOptions,
        episodeDropdownOptions: data.filter.episodeDropdownOptions,
        episodeDropdownGroups: data.filter.episodeDropdownGroups,
        locationAvailability: data.filter.locationAvailability,
      }));
    } catch (error) {
      if (!controller.signal.aborted) {
        logError("library.fetch_failed", error);
      }
    } finally {
      if (requestId === requestIdRef.current && !controller.signal.aborted) {
        setIsFiltering(false);
      }
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
      const nextView = viewOverride ?? (localViewMode === "grid" || hasFilters ? "grid" : "rows");
      lastCommittedSearchRef.current = trimmedSearch;

      const params = buildLibrarySearchParams(location, tag, episode, trimmedSearch);

      if (nextView === "grid") {
        const nextUrl = params.toString()
          ? `${PAGE_ROUTES.LIBRARY_BROWSE}?${params.toString()}`
          : PAGE_ROUTES.LIBRARY_BROWSE;
        startTransition(() => {
          router.push(nextUrl);
        });
        return;
      }

      setLocalViewMode("rows");
      const apiParams = buildLibrarySearchParams(location, tag, episode, trimmedSearch);

      const nextUrl = params.toString()
        ? `${PAGE_ROUTES.LIBRARY}?${params.toString()}`
        : PAGE_ROUTES.LIBRARY;
      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });

      fetchPayload(apiParams);
    },
    [fetchPayload, localViewMode, router],
  );

  const filterKey = `${activeLocation}-${activeTag}-${activeEpisode}-${payload.activeShelf}-${deferredSearchQuery}`;

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

  const featuredCandidates = getFeaturedCandidates(
    recordings ?? [],
    5,
    payload.featuredShortIdOrder,
  );
  const featured = featuredCandidates[0];
  const gridRecordings = recordings ?? [];
  const earlyAccessRecordings = (recordings ?? [])
    .filter((recording) => getRecordingAccessState(recording.access).isEarlyAccess)
    .slice(0, 12);
  const guildVaultRecordings = (recordings ?? [])
    .filter((recording) => {
      const accessState = getRecordingAccessState(recording.access);
      return accessState.isGuildAccess && accessState.isRestricted && !accessState.isEarlyAccess;
    })
    .slice(0, 12);

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
    startTransition(() => {
      router.push(PAGE_ROUTES.LIBRARY);
    });
  }, [router]);
  const handleBrowseAllVideos = useCallback(() => {
    updateFilters("all", "all", "all", "", "grid");
    window.scrollTo({ behavior: "auto", left: 0, top: 0 });
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
                    previousLabel={tCommon("previousFeatured")}
                    nextLabel={tCommon("nextFeatured")}
                  />
                  <div className="section-divider mb-10" />
                </>
              )}

              {localViewMode === "rows" ? (
                isFiltering ? (
                  <div className="space-y-12">
                    {Array.from(
                      { length: 3 },
                      (_, skeletonIndex) => `filter-rail-skeleton-${skeletonIndex}`,
                    ).map((skeletonId) => (
                      <RecordingsRailSkeleton key={skeletonId} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="flex justify-center">
                      <BrowseAllVideosButton
                        label={tView("allVideos")}
                        onClick={handleBrowseAllVideos}
                      />
                    </div>
                    {earlyAccessRecordings.length > 0 && (
                      <EarlyAccessRail
                        title={tRows("earlyAccess")}
                        recordings={earlyAccessRecordings}
                        scrollLeftLabel={tCommon("scrollLeft")}
                        scrollRightLabel={tCommon("scrollRight")}
                        viewAllHref={`${PAGE_ROUTES.LIBRARY_BROWSE}?shelf=${LIBRARY_SHELVES.EARLY_ACCESS}`}
                        viewAllLabel={tView("all")}
                      />
                    )}
                    {trendingSlots?.memberPicks ??
                      (memberPicks && memberPicks.length > 0 && (
                        <MemberPicksRail
                          title={tRows("memberPicks")}
                          recordings={memberPicks}
                          scrollLeftLabel={tCommon("scrollLeft")}
                          scrollRightLabel={tCommon("scrollRight")}
                          viewAllHref={`${PAGE_ROUTES.LIBRARY_BROWSE}?shelf=${LIBRARY_SHELVES.MEMBER_PICKS}`}
                          viewAllLabel={tView("all")}
                        />
                      ))}
                    {trendingSlots?.hotPicks ??
                      (hotPicks && hotPicks.length > 0 && (
                        <HotPicksRail
                          title={tRows("hot")}
                          recordings={hotPicks}
                          scrollLeftLabel={tCommon("scrollLeft")}
                          scrollRightLabel={tCommon("scrollRight")}
                          viewAllHref={`${PAGE_ROUTES.LIBRARY_BROWSE}?shelf=${LIBRARY_SHELVES.HOT}`}
                          viewAllLabel={tView("all")}
                        />
                      ))}
                    {guildVaultRecordings.length > 0 && (
                      <GuildVaultRail
                        title={tRows("guildVault")}
                        recordings={guildVaultRecordings}
                        scrollLeftLabel={tCommon("scrollLeft")}
                        scrollRightLabel={tCommon("scrollRight")}
                        viewAllHref={`${PAGE_ROUTES.LIBRARY_BROWSE}?shelf=${LIBRARY_SHELVES.GUILD_VAULT}`}
                        viewAllLabel={tView("all")}
                      />
                    )}
                    {trendingSlots?.hiddenGems ??
                      (hiddenGems && hiddenGems.length > 0 && (
                        <HiddenGemsRail
                          title={tRows("hiddenGems")}
                          recordings={hiddenGems}
                          scrollLeftLabel={tCommon("scrollLeft")}
                          scrollRightLabel={tCommon("scrollRight")}
                          viewAllHref={`${PAGE_ROUTES.LIBRARY_BROWSE}?shelf=${LIBRARY_SHELVES.HIDDEN_GEMS}`}
                          viewAllLabel={tView("all")}
                        />
                      ))}
                    {payload.rows.map((row) => {
                      const titleParams =
                        row.titleKey === "prague" || row.titleKey === "zlin"
                          ? { [row.titleKey]: tCommon(row.titleKey) }
                          : row.titleParams;
                      return (
                        <RecordingRail
                          key={`${row.key}-${filterKey}`}
                          title={tRows(row.titleKey, titleParams)}
                          recordings={row.items}
                          scrollLeftLabel={tCommon("scrollLeft")}
                          scrollRightLabel={tCommon("scrollRight")}
                        />
                      );
                    })}
                  </div>
                )
              ) : isFiltering ? (
                <RecordingsGridSkeleton />
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
