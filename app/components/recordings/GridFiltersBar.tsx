"use client";

import type { LocationFilter } from "./RecordingsCatalogTypes";
import { useTranslations } from "next-intl";
import { memo, useEffect, useLayoutEffect, useRef, useState } from "react";

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

export const GridFiltersBar = memo(function GridFiltersBar({
  activeLocation,
  activeTag,
  activeEpisode,
  searchQuery,
  tagDropdownOptions,
  episodeDropdownOptions,
  episodeDropdownGroups,
  locationAvailability,
  onLocationChange,
  onTagChange,
  onEpisodeChange,
  onSearchChange,
  onReset,
  onViewRows,
}: {
  activeLocation: LocationFilter;
  activeTag: string;
  activeEpisode: string;
  searchQuery: string;
  tagDropdownOptions: DropdownOption[];
  episodeDropdownOptions: DropdownOption[];
  episodeDropdownGroups: DropdownGroup[];
  locationAvailability: Record<LocationFilter, boolean>;
  onLocationChange: (location: LocationFilter) => void;
  onTagChange: (tag: string) => void;
  onEpisodeChange: (episode: string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  onViewRows: () => void;
}) {
  const tCommon = useTranslations("common");
  const t = useTranslations("libraryPage.filters");
  const tSearch = useTranslations("libraryPage.search");
  const tView = useTranslations("libraryPage.view");
  const inputRef = useRef<HTMLInputElement>(null);
  const [localValue, setLocalValue] = useState(searchQuery ?? "");
  const wasFocusedRef = useRef(false);

  useEffect(() => {
    setLocalValue(searchQuery ?? "");
  }, [searchQuery]);

  useLayoutEffect(() => {
    if (wasFocusedRef.current && inputRef.current && document.activeElement !== inputRef.current) {
      const { selectionStart } = inputRef.current;
      const { selectionEnd } = inputRef.current;
      inputRef.current.focus();
      if (selectionStart !== null && selectionEnd !== null) {
        inputRef.current.setSelectionRange(selectionStart, selectionEnd);
      }
    }
  }, [localValue]);

  return (
    <div className="glass relative z-10 mb-8 rounded-2xl px-4 py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2 xl:flex-nowrap">
        <div className="flex w-full flex-col gap-3 lg:w-auto lg:shrink-0 lg:flex-row lg:flex-wrap lg:items-center lg:gap-2">
          <div className="flex w-full gap-2 lg:w-auto">
            {locationOptions.map((option) => {
              const isAllOption = option.value === "all";
              const hasResults = isAllOption || locationAvailability[option.value];

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
                  className={`flex-1 lg:flex-none ${(() => {
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
                  })()}`}
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
          <div className="hidden h-5 w-px shrink-0 bg-neutral-300/60 lg:block dark:bg-white/10" />
          <div className="relative w-full lg:w-auto">
            <SelectDropdown
              value={activeTag}
              options={tagDropdownOptions}
              nativeOnMobile
              onChange={onTagChange}
              buttonClassName={`min-w-0 w-full rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-3 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 lg:w-40 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
                activeTag !== "all"
                  ? "text-brand-600 dark:text-brand-300"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
              nativeClassName={`w-full rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-8 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 lg:w-44 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
                activeTag !== "all"
                  ? "text-brand-600 dark:text-brand-300"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            />
          </div>
          <div className="relative w-full lg:w-auto">
            <SelectDropdown
              value={activeEpisode}
              options={episodeDropdownOptions}
              groups={episodeDropdownGroups}
              nativeOnMobile
              onChange={onEpisodeChange}
              buttonClassName={`min-w-0 w-full rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-3 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 lg:w-72 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
                activeEpisode !== "all"
                  ? "text-brand-600 dark:text-brand-300"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
              nativeClassName={`w-full min-w-0 rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-8 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 lg:w-64 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
                activeEpisode !== "all"
                  ? "text-brand-600 dark:text-brand-300"
                  : "text-neutral-600 dark:text-neutral-300"
              }`}
            />
          </div>
        </div>

        <div className="w-full min-w-0 lg:flex-1">
          <input
            ref={inputRef}
            type="search"
            value={localValue}
            onFocus={() => {
              wasFocusedRef.current = true;
            }}
            onBlur={() => {
              wasFocusedRef.current = false;
            }}
            onChange={(e) => {
              const newValue = e.target.value;
              setLocalValue(newValue);
              onSearchChange(newValue);
            }}
            placeholder={tSearch("placeholder")}
            aria-label={tSearch("label")}
            className="focus:ring-brand-500/50 dark:focus:ring-brand-400/50 w-full min-w-0 rounded-lg border-0 bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-black/5 transition placeholder:text-neutral-400 focus:ring-2 focus:outline-none dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:placeholder:text-neutral-500"
          />
        </div>

        <div className="flex w-full shrink-0 gap-2 lg:contents">
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
            className={`flex-1 rounded-lg font-medium transition lg:flex-none ${
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
            className="flex-1 rounded-lg bg-white/80 font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white lg:ml-auto lg:flex-none dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-white/15"
          >
            {tView("rows")}
          </Button>
        </div>
      </div>
    </div>
  );
});
