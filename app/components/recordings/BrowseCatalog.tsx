"use client";

import type { LibraryApiPayload, LibraryBasePayload } from "@/lib/recordings/library-filter";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useDeferredValue, useEffect, useRef, useState } from "react";

import { InfoIcon } from "@/components/shared/Icons";
import { Skeleton } from "@/components/shared/Skeletons";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { EmptyState } from "../ui/EmptyState";

import { EmptyStateMessage } from "./EmptyStateMessage";
import { GridFiltersBar } from "./GridFiltersBar";
import { GridView } from "./GridView";
import { type LocationFilter, UNRECORDED_EPISODES } from "./RecordingsCatalogTypes";

const MIN_SEARCH_LENGTH = 2;

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

export function BrowseCatalog({ initialPayload }: { initialPayload: LibraryBasePayload }) {
  const tCommon = useTranslations("common");
  const tLibrary = useTranslations("libraryPage");
  const locale = useLocale();
  const router = useRouter();
  const [payload, setPayload] = useState<LibraryBasePayload>(initialPayload);
  const [localSearchQuery, setLocalSearchQuery] = useState(initialPayload.searchQuery);
  const deferredSearchQuery = useDeferredValue(payload.searchQuery);
  const [isFiltering, setIsFiltering] = useState(false);
  const [rateLimitError, setRateLimitError] = useState(false);
  const searchDebounceRef = useRef<number | null>(null);
  const requestIdRef = useRef(0);
  const activeRequestRef = useRef<AbortController | null>(null);
  const lastCommittedSearchRef = useRef(initialPayload.searchQuery);
  const { activeLocation } = payload;
  const { activeTag } = payload;
  const { activeEpisode } = payload;
  const { recordings } = payload;

  useEffect(() => {
    setPayload(initialPayload);
    setLocalSearchQuery(initialPayload.searchQuery);
    lastCommittedSearchRef.current = initialPayload.searchQuery;
  }, [initialPayload]);

  useEffect(() => {
    setLocalSearchQuery(payload.searchQuery);
    lastCommittedSearchRef.current = payload.searchQuery;
  }, [payload.searchQuery]);

  const buildParams = useCallback(
    (location: LocationFilter, tag: string, episode: string, search: string) => {
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

      return params;
    },
    [],
  );

  const fetchPayload = useCallback(async (params: URLSearchParams) => {
    requestIdRef.current += 1;
    const requestId = requestIdRef.current;
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }
    const controller = new AbortController();
    activeRequestRef.current = controller;

    setIsFiltering(true);
    setRateLimitError(false);
    try {
      const response = await fetch(`/api/v1/library?${params.toString()}`, {
        signal: controller.signal,
      });
      if (response.status === 429) {
        if (requestId === requestIdRef.current && !controller.signal.aborted) {
          setRateLimitError(true);
        }
        return;
      }
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as LibraryApiPayload;
      if (requestId !== requestIdRef.current || controller.signal.aborted) {
        return;
      }
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
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      return;
    } finally {
      if (requestId === requestIdRef.current && !controller.signal.aborted) {
        setIsFiltering(false);
      }
    }
  }, []);

  const updateFilters = useCallback(
    (location: LocationFilter, tag: string, episode: string, search = "") => {
      const trimmedSearch = search.trim();
      lastCommittedSearchRef.current = trimmedSearch;

      const params = buildParams(location, tag, episode, trimmedSearch);

      const nextUrl = params.toString()
        ? `${PAGE_ROUTES.LIBRARY_BROWSE}?${params.toString()}`
        : PAGE_ROUTES.LIBRARY_BROWSE;
      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });

      fetchPayload(params);
    },
    [buildParams, fetchPayload],
  );

  const filterKey = `${activeLocation}-${activeTag}-${activeEpisode}-${deferredSearchQuery}`;


  useEffect(() => {
    const trimmed = localSearchQuery.trim();
    if (trimmed === lastCommittedSearchRef.current) {
      return;
    }

    const isValidSearch = trimmed.length === 0 || trimmed.length >= MIN_SEARCH_LENGTH;
    if (!isValidSearch) {
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

  const handleReset = useCallback(() => {
    setLocalSearchQuery("");
    updateFilters("all", "all", "all", "");
  }, [updateFilters]);

  const handleViewRows = useCallback(() => {
    startTransition(() => {
      router.push(PAGE_ROUTES.LIBRARY);
    });
  }, [router]);

  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-2 sm:mb-6" />

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

        <div className="section-divider mb-8" />

        <div
          className={`min-h-[700px] transition-opacity duration-300 ${
            isFiltering ? "opacity-70" : "opacity-100"
          }`}
        >
          {rateLimitError ? (
            <EmptyState
              message={tLibrary("rateLimitError")}
              className="recording-card-enter max-w-lg p-12"
              messageClassName="text-lg text-amber-600 dark:text-amber-400"
            />
          ) : recordings.length === 0 ? (
            <EmptyStateMessage
              activeEpisode={activeEpisode}
              onReset={() => updateFilters("all", "all", "all", "")}
            />
          ) : isFiltering ? (
            <GridSkeleton />
          ) : (
            <GridView recordings={recordings} locale={locale} filterKey={filterKey} />
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
