"use client";

import { useEffect, useMemo, useRef, useState, useDeferredValue, useCallback, memo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { InfoIcon } from "@/components/shared/icons";
import { Skeleton } from "@/components/shared/Skeletons";
import { LOCATIONS } from "@/lib/config/constants";
import { getEpisodeById } from "@/lib/recordings/episodes";
import { RecordingRail } from "./RecordingRail";
import { MemberPicksRail } from "./MemberPicksRail";
import { HotPicksRail } from "./HotPicksRail";
import { GridFiltersBar } from "./GridFiltersBar";
import { FeaturedRecording } from "./FeaturedRecording";
import { GridView } from "./GridView";
import { EmptyStateMessage } from "./EmptyStateMessage";
import {
  type CatalogRecording,
  type MemberPickRecording,
  type HotRecording,
  type LocationFilter,
  type RecordingsCatalogLabels,
  normalizeText,
  UNRECORDED_EPISODES,
} from "./RecordingsCatalogTypes";

function RailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <div className="flex gap-5 overflow-hidden pb-4 pt-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="w-[75vw] shrink-0 sm:w-[45vw] lg:w-[280px] xl:w-[300px]">
            <Skeleton className="aspect-video w-full !rounded-none" />
            <div className="space-y-3 bg-white/85 px-4 pb-5 pt-4 dark:bg-black/75">
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
        <div key={index} className="overflow-hidden rounded-[28px]">
          <Skeleton className="aspect-video w-full !rounded-none" />
          <div className="space-y-3 bg-white/85 px-5 pb-6 pt-5 dark:bg-black/75">
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
      className="rounded-full bg-gradient-to-r from-brand-500 to-rose-500 text-white shadow-lg shadow-brand-500/20"
    >
      {label}
    </Button>
  );
}

export const RecordingsCatalog = memo(function RecordingsCatalog({
  recordings,
  memberPicks,
  hotPicks,
  labels,
  locale,
  initialFilters,
  preFilteredRecordings,
  scrollLeftLabel,
  scrollRightLabel,
  previousFeaturedLabel,
  nextFeaturedLabel,
}: {
  recordings: CatalogRecording[];
  memberPicks: MemberPickRecording[];
  hotPicks: HotRecording[];
  labels: RecordingsCatalogLabels;
  locale: string;
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
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
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
            number: recording.episodeNumber,
            location: recording.location,
            title,
          });
        }
      }
    });

    for (const episodeId of UNRECORDED_EPISODES) {
      if (map.has(episodeId)) continue;
      const episode = getEpisodeById(episodeId);
      if (!episode) continue;
      map.set(episodeId, {
        number: episode.number,
        location: episode.city === "prague" ? LOCATIONS.PRAGUE : LOCATIONS.ZLIN,
        title: episode.title,
      });
    }

    return Array.from(map.entries()).map(([id, data]) => ({
      value: id,
      label: data.number ? `${labels.epShort} ${data.number} — ${data.title}` : data.title,
      number: data.number || 0,
      location: data.location,
    }));
  }, [recordings, activeLocation, activeTag, labels.epShort]);

  const groupedEpisodes = useMemo(() => {
    const prague = episodeOptions
      .filter((e) => e.location === LOCATIONS.PRAGUE)
      .sort((a, b) => b.number - a.number);
    const zlin = episodeOptions
      .filter((e) => e.location === LOCATIONS.ZLIN)
      .sort((a, b) => b.number - a.number);

    return [
      { label: labels.filters.prague, options: prague },
      { label: labels.filters.zlin, options: zlin },
    ].filter((group) => group.options.length > 0);
  }, [episodeOptions, labels.filters.prague, labels.filters.zlin]);

  const tagDropdownOptions = useMemo(
    () =>
      tagOptions.map((tag) => ({
        value: tag,
        label: tag === "all" ? labels.filters.allTags : tag,
      })),
    [labels.filters.allTags, tagOptions],
  );

  const episodeDropdownOptions = useMemo(
    () => [{ value: "all", label: labels.filters.allEpisodes }],
    [labels.filters.allEpisodes],
  );

  const episodeDropdownGroups = useMemo(
    () =>
      groupedEpisodes.map((group) => ({
        label: group.label,
        options: group.options.map((option) => ({
          value: option.value,
          label: option.label,
        })),
      })),
    [groupedEpisodes],
  );

  useEffect(() => {
    const locationParam = searchParams.get("location") ?? "all";
    const tagParam = searchParams.get("tag") ?? "all";
    const episodeParam = searchParams.get("episode") ?? "all";
    const queryParam = searchParams.get("q") ?? "";
    const normalizedLocation =
      locationParam === LOCATIONS.PRAGUE || locationParam === LOCATIONS.ZLIN
        ? locationParam
        : "all";
    const normalizedTag = tagOptions.includes(tagParam) ? tagParam : "all";
    const normalizedEpisode =
      episodeOptions.some((option) => option.value === episodeParam) ||
      UNRECORDED_EPISODES.has(episodeParam)
        ? episodeParam
        : "all";
    const normalizedQuery = queryParam.trim();

    const matchesInitialState =
      initialFilters &&
      normalizedLocation === initialFilters.location &&
      normalizedTag === initialFilters.tag &&
      normalizedEpisode === initialFilters.episode &&
      normalizedQuery === initialFilters.searchQuery.trim();

    if (matchesInitialState) {
      return;
    }

    setActiveLocation(normalizedLocation);
    setActiveTag(normalizedTag);
    setActiveEpisode(normalizedEpisode);
    if (!isSearchDirtyRef.current || normalizedQuery === lastCommittedSearchRef.current) {
      setSearchQuery(normalizedQuery);
      lastCommittedSearchRef.current = normalizedQuery;
      isSearchDirtyRef.current = false;
    }
  }, [searchParams, tagOptions, episodeOptions, initialFilters]);

  const updateFilters = useCallback(
    (location: LocationFilter, tag: string, episode: string, search = "") => {
      const trimmedSearch = search.trim();
      lastCommittedSearchRef.current = trimmedSearch;
      isSearchDirtyRef.current = false;
      const params = new URLSearchParams(searchParams.toString());
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
      router.replace(queryString ? `${PAGE_ROUTES.LIBRARY}?${queryString}` : PAGE_ROUTES.LIBRARY);
    },
    [router, searchParams],
  );

  const filteredRecordings = useMemo(() => {
    const filtersUnchanged =
      initialFilters &&
      activeLocation === initialFilters.location &&
      activeTag === initialFilters.tag &&
      activeEpisode === initialFilters.episode &&
      deferredSearchQuery.trim() === initialFilters.searchQuery.trim();

    if (filtersUnchanged && preFilteredRecordings) {
      return preFilteredRecordings;
    }

    const normalizedQuery = normalizeText(deferredSearchQuery.trim());
    return recordings.filter((recording) => {
      const matchesLocation = activeLocation === "all" || recording.location === activeLocation;
      const matchesTag = activeTag === "all" || recording.tags.includes(activeTag);
      const matchesEpisode = activeEpisode === "all" || recording.episodeId === activeEpisode;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        normalizeText(recording.title).includes(normalizedQuery) ||
        recording.speaker.some((name: string) => normalizeText(name).includes(normalizedQuery)) ||
        recording.tags.some((tag: string) => normalizeText(tag).includes(normalizedQuery)) ||
        normalizeText(recording.location).includes(normalizedQuery) ||
        (recording.episode ? normalizeText(recording.episode).includes(normalizedQuery) : false) ||
        (recording.description
          ? normalizeText(recording.description).includes(normalizedQuery)
          : false);
      return matchesLocation && matchesTag && matchesEpisode && matchesSearch;
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
  const hasActiveFilters =
    activeLocation !== "all" ||
    activeTag !== "all" ||
    activeEpisode !== "all" ||
    deferredSearchQuery.trim() !== "";

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
    const trimmed = searchQuery.trim();
    const currentQueryParam = searchParams.get("q") ?? "";
    if (trimmed === currentQueryParam) return;
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
  }, [searchQuery, activeLocation, activeTag, activeEpisode, searchParams, updateFilters]);

  const handleBrowseAll = () => {
    setViewMode("grid");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  };

  type RailRow = {
    key: string;
    title: string;
    items: CatalogRecording[];
  };

  const featuredCandidates = filteredRecordings.slice(0, 5);
  const featured = featuredCandidates[0];
  const gridRecordings = filteredRecordings;

  const latestRecordings = useMemo(() => {
    return filteredRecordings.slice(0, 12);
  }, [filteredRecordings]);

  const locationRows = useMemo(() => {
    const rows: RailRow[] = [];
    const pragueItems = filteredRecordings.filter((r) => r.location === LOCATIONS.PRAGUE);
    const zlinItems = filteredRecordings.filter((r) => r.location === LOCATIONS.ZLIN);

    if (activeLocation === "all") {
      if (pragueItems.length > 0) {
        rows.push({ key: "location-prague", title: labels.rows.prague, items: pragueItems });
      }
      if (zlinItems.length > 0) {
        rows.push({ key: "location-zlin", title: labels.rows.zlin, items: zlinItems });
      }
      return rows;
    }

    if (activeLocation === LOCATIONS.PRAGUE && pragueItems.length > 0) {
      rows.push({ key: "location-prague", title: labels.rows.prague, items: pragueItems });
    }
    if (activeLocation === LOCATIONS.ZLIN && zlinItems.length > 0) {
      rows.push({ key: "location-zlin", title: labels.rows.zlin, items: zlinItems });
    }

    return rows;
  }, [activeLocation, filteredRecordings, labels.rows.prague, labels.rows.zlin]);

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
        key: `tag-${tag}`,
        title: labels.rows.topic.replace("{tag}", tag),
        items: filteredRecordings.filter((recording) => recording.tags.includes(tag)),
      }))
      .filter((row) => row.items.length > 0);
  }, [activeTag, filteredRecordings, labels.rows.topic]);

  const rows = useMemo(() => {
    const nextRows: RailRow[] = [];
    if (latestRecordings.length > 0) {
      nextRows.push({ key: "latest", title: labels.rows.latest, items: latestRecordings });
    }
    return [...nextRows, ...locationRows, ...tagRows];
  }, [latestRecordings, locationRows, tagRows, labels.rows.latest]);

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
            labels={labels}
            onLocationChange={(location) =>
              updateFilters(location, activeTag, activeEpisode, searchQuery)
            }
            onTagChange={(tag) => updateFilters(activeLocation, tag, activeEpisode, searchQuery)}
            onEpisodeChange={(episode) =>
              updateFilters(activeLocation, activeTag, episode, searchQuery)
            }
            onSearchChange={setSearchQuery}
            onReset={() => updateFilters("all", "all", "all", "")}
            onViewRows={() => {
              setViewMode("rows");
              updateFilters("all", "all", "all", "");
            }}
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
              labels={labels}
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
                      <RailSkeleton key={index} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-12">
                    <div className="flex justify-center">
                      <BrowseAllButton label={labels.view.all} onClick={handleBrowseAll} />
                    </div>
                    <MemberPicksRail
                      title={labels.rows.memberPicks}
                      recordings={memberPicks}
                      locale={locale}
                      labels={labels}
                      scrollLeftLabel={scrollLeftLabel}
                      scrollRightLabel={scrollRightLabel}
                    />
                    <HotPicksRail
                      title={labels.rows.hot}
                      recordings={hotPicks}
                      locale={locale}
                      labels={labels}
                      scrollLeftLabel={scrollLeftLabel}
                      scrollRightLabel={scrollRightLabel}
                    />
                    {rows.map((row) => (
                      <RecordingRail
                        key={`${row.key}-${filterKey}`}
                        title={row.title}
                        recordings={row.items}
                        locale={locale}
                        labels={labels}
                        scrollLeftLabel={scrollLeftLabel}
                        scrollRightLabel={scrollRightLabel}
                      />
                    ))}
                    <div className="flex justify-center">
                      <BrowseAllButton label={labels.view.all} onClick={handleBrowseAll} />
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-400">
                <InfoIcon className="h-5 w-5" />
              </div>
              <p className="max-w-4xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                <span className="mr-1.5 font-semibold text-neutral-900 dark:text-white">
                  {labels.noteLabel}
                </span>
                {labels.disclaimer}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
});
