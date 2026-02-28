"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition, useCallback, useDeferredValue, useEffect, useRef, useState } from "react";

import {
  BoltIcon,
  CloseIcon,
  EarlyAccessIcon,
  GuildIcon,
  InfoIcon,
  SparklesIcon,
} from "@/components/shared/Icons";
import {
  LIBRARY_SHELVES,
  type LibraryApiPayload,
  type LibraryBasePayload,
} from "@/lib/recordings/library-filter";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { logError } from "@/lib/utils/log-client";

import { EmptyState } from "../ui/EmptyState";

import { EmptyStateMessage } from "./EmptyStateMessage";
import { GridFiltersBar } from "./GridFiltersBar";
import { GridView } from "./GridView";
import { buildLibrarySearchParams, fetchLibraryApiPayload } from "./library-client-utils";
import { RecordingsGridSkeleton } from "./RecordingLoadingSkeletons";
import { type LocationFilter, UNRECORDED_EPISODES } from "./RecordingsCatalogTypes";

const MIN_SEARCH_LENGTH = 2;

export function BrowseCatalog({ initialPayload }: { initialPayload: LibraryBasePayload }) {
  const tCommon = useTranslations("common");
  const tLibrary = useTranslations("libraryPage");
  const tRows = useTranslations("libraryPage.rows");
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
  const { activeShelf } = payload;
  const { recordings } = payload;
  const shelfHeader =
    activeShelf === LIBRARY_SHELVES.EARLY_ACCESS
      ? {
          icon: <EarlyAccessIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />,
          title: tRows("earlyAccess"),
        }
      : activeShelf === LIBRARY_SHELVES.GUILD_VAULT
        ? {
            icon: <GuildIcon className="h-4 w-4 text-red-600 dark:text-red-300" />,
            title: tRows("guildVault"),
          }
        : activeShelf === LIBRARY_SHELVES.MEMBER_PICKS
          ? {
              icon: <BoltIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />,
              title: tRows("memberPicks"),
            }
          : activeShelf === LIBRARY_SHELVES.HOT
            ? {
                icon: <SparklesIcon className="h-4 w-4 text-rose-600 dark:text-rose-300" />,
                title: tRows("hot"),
              }
            : activeShelf === LIBRARY_SHELVES.HIDDEN_GEMS
              ? {
                  icon: <SparklesIcon className="h-4 w-4 text-purple-600 dark:text-purple-300" />,
                  title: tRows("hiddenGems"),
                }
              : null;

  useEffect(() => {
    setPayload(initialPayload);
    setLocalSearchQuery(initialPayload.searchQuery);
    lastCommittedSearchRef.current = initialPayload.searchQuery;
  }, [initialPayload]);

  useEffect(() => {
    setLocalSearchQuery(payload.searchQuery);
    lastCommittedSearchRef.current = payload.searchQuery;
  }, [payload.searchQuery]);

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
      const result = await fetchLibraryApiPayload(params, controller.signal);
      if (result.status === 429) {
        if (requestId === requestIdRef.current && !controller.signal.aborted) {
          setRateLimitError(true);
        }
        return;
      }
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
    (location: LocationFilter, tag: string, episode: string, search = "", shelf = activeShelf) => {
      const trimmedSearch = search.trim();
      lastCommittedSearchRef.current = trimmedSearch;

      const params = buildLibrarySearchParams(location, tag, episode, trimmedSearch, shelf);

      const nextUrl = params.toString()
        ? `${PAGE_ROUTES.LIBRARY_BROWSE}?${params.toString()}`
        : PAGE_ROUTES.LIBRARY_BROWSE;
      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });

      fetchPayload(params);
    },
    [activeShelf, fetchPayload, router],
  );

  const filterKey = `${activeLocation}-${activeTag}-${activeEpisode}-${activeShelf}-${deferredSearchQuery}`;

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
    updateFilters("all", "all", "all", "", activeShelf);
  }, [activeShelf, updateFilters]);

  const handleViewRows = useCallback(() => {
    startTransition(() => {
      router.push(PAGE_ROUTES.LIBRARY);
    });
  }, [router]);

  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-2 sm:mb-6" />

        {shelfHeader && (
          <div className="mb-6 rounded-2xl border border-black/10 bg-white/70 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
                  {shelfHeader.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.14em] text-neutral-500 uppercase dark:text-neutral-400">
                    Shelf
                  </p>
                  <h2 className="truncate text-lg font-bold tracking-tight text-neutral-900 sm:text-xl dark:text-white">
                    {shelfHeader.title}
                  </h2>
                </div>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 dark:bg-white/10">
                <button
                  type="button"
                  onClick={() =>
                    updateFilters(
                      activeLocation,
                      activeTag,
                      activeEpisode,
                      localSearchQuery,
                      LIBRARY_SHELVES.ALL,
                    )
                  }
                  aria-label="Clear shelf filter"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-black/10 bg-white/70 text-neutral-600 transition hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  <CloseIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

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
              onReset={() => updateFilters("all", "all", "all", "", activeShelf)}
            />
          ) : isFiltering ? (
            <RecordingsGridSkeleton />
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
