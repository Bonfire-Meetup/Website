"use client";

import type { CatalogRecording, LocationFilter } from "./RecordingsCatalogTypes";
import { useTranslations } from "next-intl";

import { LOCATIONS } from "@/lib/config/constants";

import { Button } from "../ui/Button";
import { type DropdownGroup, type DropdownOption, SelectDropdown } from "../ui/SelectDropdown";

const locationOptions: {
  value: LocationFilter;
  labelKey: "allLocations" | "prague" | "zlin";
}[] = [
  { labelKey: "allLocations", value: "all" },
  { labelKey: "prague", value: LOCATIONS.PRAGUE },
  { labelKey: "zlin", value: LOCATIONS.ZLIN },
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
  onLocationChange: (location: LocationFilter) => void;
  onTagChange: (tag: string) => void;
  onEpisodeChange: (episode: string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  onViewRows: () => void;
  isSearchDirtyRef: React.MutableRefObject<boolean>;
}) {
  const tCommon = useTranslations("common");
  const t = useTranslations("libraryPage.filters");
  const tSearch = useTranslations("libraryPage.search");
  const tView = useTranslations("libraryPage.view");
  return (
    <div className="glass relative z-10 mb-8 rounded-2xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap lg:gap-2">
        <div className="flex items-center gap-2">
          {locationOptions.map((option) => {
            const isAllOption = option.value === "all";
            const hasMatchingRecordings = recordings.some((r) => {
              const isLocationMatch = r.location === option.value;
              const isTagMatch = activeTag === "all" || r.tags.includes(activeTag);
              const isEpisodeMatch = activeEpisode === "all" || r.episodeId === activeEpisode;
              return isLocationMatch && isTagMatch && isEpisodeMatch;
            });
            const hasResults = isAllOption || hasMatchingRecordings;

            const shouldPreventClick = !hasResults && activeLocation !== option.value;

            return (
              <Button
                key={option.value}
                onClick={() => {
                  if (shouldPreventClick) {
                    return;
                  }
                  onLocationChange(option.value);
                }}
                variant="plain"
                size="sm"
                className={(() => {
                  const isActive = activeLocation === option.value;
                  const isPrague = option.value === LOCATIONS.PRAGUE;
                  const isZlin = option.value === LOCATIONS.ZLIN;
                  const isDisabled = !hasResults;

                  if (isActive) {
                    if (isPrague) {
                      return "rounded-full font-medium transition bg-red-500 text-white shadow-sm shadow-red-500/25";
                    }
                    if (isZlin) {
                      return "rounded-full font-medium transition bg-blue-500 text-white shadow-sm shadow-blue-500/25";
                    }
                    return "rounded-full font-medium transition bg-rose-500 text-white shadow-sm shadow-rose-500/25";
                  }

                  if (isDisabled) {
                    return "rounded-full font-medium transition cursor-not-allowed bg-neutral-100 text-neutral-400 opacity-50 dark:bg-white/5 dark:text-neutral-600";
                  }

                  return "rounded-full font-medium transition bg-white/80 text-neutral-600 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15";
                })()}
              >
                {(() => {
                  const isPragueLabel = option.labelKey === "prague";
                  const isZlinLabel = option.labelKey === "zlin";
                  if (isPragueLabel) {
                    return t(option.labelKey, { prague: tCommon("prague") });
                  }
                  if (isZlinLabel) {
                    return t(option.labelKey, { zlin: tCommon("zlin") });
                  }
                  return t(option.labelKey);
                })()}
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
            placeholder={tSearch("placeholder")}
            aria-label={tSearch("label")}
            className="focus:ring-brand-500/50 dark:focus:ring-brand-400/50 w-full min-w-[220px] rounded-lg border-0 bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-black/5 transition placeholder:text-neutral-400 focus:ring-2 focus:outline-none dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:placeholder:text-neutral-500"
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
          {t("reset")}
        </Button>
        <Button
          onClick={onViewRows}
          variant="plain"
          size="sm"
          className="ml-auto w-full rounded-lg bg-white/80 font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white sm:w-auto dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-white/15"
        >
          {tView("rows")}
        </Button>
      </div>
    </div>
  );
}
