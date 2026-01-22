"use client";

import { Button } from "../ui/Button";
import { SelectDropdown, type DropdownGroup, type DropdownOption } from "../ui/SelectDropdown";
import { LOCATIONS } from "@/lib/config/constants";
import type {
  LocationFilter,
  CatalogRecording,
  RecordingsCatalogLabels,
} from "./RecordingsCatalogTypes";

const locationOptions: {
  value: LocationFilter;
  labelKey: keyof RecordingsCatalogLabels["filters"];
}[] = [
  { value: "all", labelKey: "allLocations" },
  { value: LOCATIONS.PRAGUE, labelKey: "prague" },
  { value: LOCATIONS.ZLIN, labelKey: "zlin" },
];

export function GridFiltersBar({
  recordings,
  activeLocation,
  activeTag,
  activeEpisode,
  searchQuery,
  tagDropdownOptions,
  episodeDropdownOptions,
  episodeDropdownGroups,
  labels,
  onLocationChange,
  onTagChange,
  onEpisodeChange,
  onSearchChange,
  onReset,
  onViewRows,
  isSearchDirtyRef,
}: {
  recordings: CatalogRecording[];
  activeLocation: LocationFilter;
  activeTag: string;
  activeEpisode: string;
  searchQuery: string;
  tagDropdownOptions: DropdownOption[];
  episodeDropdownOptions: DropdownOption[];
  episodeDropdownGroups: DropdownGroup[];
  labels: RecordingsCatalogLabels;
  onLocationChange: (location: LocationFilter) => void;
  onTagChange: (tag: string) => void;
  onEpisodeChange: (episode: string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  onViewRows: () => void;
  isSearchDirtyRef: React.MutableRefObject<boolean>;
}) {
  return (
    <div className="glass relative z-10 mb-8 rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-2">
        <div className="flex items-center gap-2">
          {locationOptions.map((option) => {
            const hasResults =
              option.value === "all" ||
              recordings.some(
                (r) =>
                  r.location === option.value &&
                  (activeTag === "all" || r.tags.includes(activeTag)) &&
                  (activeEpisode === "all" || r.episodeId === activeEpisode),
              );

            return (
              <Button
                key={option.value}
                onClick={() => {
                  if (!hasResults && activeLocation !== option.value) return;
                  onLocationChange(option.value);
                }}
                variant="plain"
                size="sm"
                className={`rounded-full font-medium transition ${
                  activeLocation === option.value
                    ? option.value === LOCATIONS.PRAGUE
                      ? "bg-red-500 text-white shadow-sm shadow-red-500/25"
                      : option.value === LOCATIONS.ZLIN
                        ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25"
                        : "bg-rose-500 text-white shadow-sm shadow-rose-500/25"
                    : !hasResults
                      ? "cursor-not-allowed bg-neutral-100 text-neutral-400 opacity-50 dark:bg-white/5 dark:text-neutral-600"
                      : "bg-white/80 text-neutral-600 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15"
                }`}
              >
                {labels.filters[option.labelKey]}
              </Button>
            );
          })}
        </div>

        <div className="hidden h-5 w-px bg-neutral-300/60 sm:block dark:bg-white/10" />

        <div className="relative">
          <SelectDropdown
            value={activeTag}
            options={tagDropdownOptions}
            nativeOnMobile
            onChange={onTagChange}
            buttonClassName={`min-w-0 w-36 rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-3 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 sm:w-40 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
              activeTag !== "all"
                ? "text-brand-600 dark:text-brand-300"
                : "text-neutral-600 dark:text-neutral-300"
            }`}
            nativeClassName={`w-40 rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-8 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 sm:w-44 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
              activeTag !== "all"
                ? "text-brand-600 dark:text-brand-300"
                : "text-neutral-600 dark:text-neutral-300"
            }`}
          />
        </div>

        <div className="relative">
          <SelectDropdown
            value={activeEpisode}
            options={episodeDropdownOptions}
            groups={episodeDropdownGroups}
            nativeOnMobile
            onChange={onEpisodeChange}
            buttonClassName={`min-w-0 w-56 rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-3 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 sm:w-64 lg:w-72 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
              activeEpisode !== "all"
                ? "text-brand-600 dark:text-brand-300"
                : "text-neutral-600 dark:text-neutral-300"
            }`}
            nativeClassName={`w-full min-w-[16rem] rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-8 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 sm:w-64 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
              activeEpisode !== "all"
                ? "text-brand-600 dark:text-brand-300"
                : "text-neutral-600 dark:text-neutral-300"
            }`}
          />
        </div>

        <div className="relative flex-1">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              isSearchDirtyRef.current = true;
              onSearchChange(e.target.value);
            }}
            placeholder={labels.search.placeholder}
            aria-label={labels.search.label}
            className="w-full min-w-[220px] rounded-lg border-0 bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-black/5 transition placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:placeholder:text-neutral-500 dark:focus:ring-brand-400/50"
          />
        </div>

        <Button
          onClick={onReset}
          disabled={
            activeLocation === "all" &&
            activeTag === "all" &&
            activeEpisode === "all" &&
            searchQuery === ""
          }
          variant="plain"
          size="sm"
          className={`rounded-lg font-medium transition ${
            activeLocation === "all" &&
            activeTag === "all" &&
            activeEpisode === "all" &&
            searchQuery === ""
              ? "cursor-not-allowed text-neutral-400 dark:text-neutral-500"
              : "text-neutral-600 hover:bg-white/80 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
          }`}
        >
          {labels.filters.reset}
        </Button>
        <Button
          onClick={onViewRows}
          variant="plain"
          size="sm"
          className="ml-auto w-full rounded-lg bg-white/80 font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white sm:w-auto dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-white/15"
        >
          {labels.view.rows}
        </Button>
      </div>
    </div>
  );
}
