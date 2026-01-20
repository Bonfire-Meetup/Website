"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Recording } from "../lib/recordings";
import { AccentBar } from "./AccentBar";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, InfoIcon } from "./icons";
import { Pill } from "./Pill";
import { Skeleton } from "./Skeletons";

import { LOCATIONS, type LocationValue } from "../lib/constants";
import { getEpisodeById } from "../lib/episodes";

type LocationFilter = "all" | LocationValue;

type CatalogRecording = Pick<
  Recording,
  | "shortId"
  | "slug"
  | "title"
  | "speaker"
  | "date"
  | "thumbnail"
  | "featureHeroThumbnail"
  | "description"
  | "tags"
  | "location"
  | "episodeId"
  | "episode"
  | "episodeNumber"
>;

interface RecordingsCatalogLabels {
  eyebrow: string;
  title: string;
  subtitle: string;
  rows: {
    latest: string;
    prague: string;
    zlin: string;
    topic: string;
  };
  view: {
    all: string;
    rows: string;
  };
  search: {
    label: string;
    placeholder: string;
  };
  filters: {
    title: string;
    location: string;
    tag: string;
    episode: string;
    reset: string;
    allLocations: string;
    allTags: string;
    allEpisodes: string;
    prague: string;
    zlin: string;
  };
  empty: string;
  disclaimer: string;
  noteLabel: string;
  epShort: string;
  notRecorded: {
    title: string;
    body: string;
    cta: string;
  };
}

const locationOptions: {
  value: LocationFilter;
  labelKey: keyof RecordingsCatalogLabels["filters"];
}[] = [
  { value: "all", labelKey: "allLocations" },
  { value: LOCATIONS.PRAGUE, labelKey: "prague" },
  { value: LOCATIONS.ZLIN, labelKey: "zlin" },
];

function formatDate(date: string, locale: string) {
  return new Date(date).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

const metaBaseClass =
  "flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase text-neutral-600 dark:text-white/70";

function getLocationPillClass(location: LocationValue) {
  return location === LOCATIONS.PRAGUE
    ? "bg-rose-500/10 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300"
    : "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300";
}

function RecordingMeta({
  location,
  date,
  locale,
  trackingClass,
}: {
  location: LocationValue;
  date: string;
  locale: string;
  trackingClass: string;
}) {
  return (
    <div className={`${metaBaseClass} ${trackingClass}`}>
      <Pill size="xxs" className={getLocationPillClass(location)}>
        {location}
      </Pill>
      <span className="text-neutral-400 dark:text-white/50">•</span>
      <span>{formatDate(date, locale)}</span>
    </div>
  );
}

function SpeakerList({ speakers }: { speakers: string[] }) {
  return (
    <div className="flex flex-col gap-1.5">
      {speakers.map((name) => (
        <div key={name} className="flex items-center gap-2">
          <span className="h-1 w-1 shrink-0 rounded-full bg-brand-500 shadow-[0_0_6px_rgba(59,130,246,0.4)] dark:bg-brand-400" />
          <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
            {name}
          </span>
        </div>
      ))}
    </div>
  );
}

const FEATURED_INTERVAL_MS = 6000;
const UNRECORDED_EPISODES = new Set(["prague-1", "prague-2"]);

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
      <ChevronRightIcon className="h-3.5 w-3.5" />
    </Button>
  );
}

function RecordingRailCard({
  recording,
  locale,
  labels,
}: {
  recording: CatalogRecording;
  locale: string;
  labels: RecordingsCatalogLabels;
}) {
  return (
    <Link
      href={`/watch/${recording.slug}-${recording.shortId}`}
      className="group relative flex w-[75vw] shrink-0 snap-start flex-col overflow-hidden rounded-[24px] bg-white/90 text-neutral-900 shadow-lg shadow-black/5 ring-1 ring-black/5 transition-all hover:-translate-y-1 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10 sm:w-[45vw] lg:w-[280px] xl:w-[300px]"
      aria-label={recording.title}
    >
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={recording.thumbnail}
          alt={recording.title}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 75vw, (max-width: 1024px) 45vw, 300px"
        />
      </div>
      <div className="flex flex-1 flex-col space-y-3 bg-white/85 px-4 pb-5 pt-4 text-neutral-900 dark:bg-black/75 dark:text-white">
        <RecordingMeta
          location={recording.location}
          date={recording.date}
          locale={locale}
          trackingClass="tracking-[0.2em]"
        />
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 dark:text-white">
          {recording.title}
        </h3>
        <SpeakerList speakers={recording.speaker} />
        <div className="flex flex-wrap gap-2">
          {recording.tags.slice(0, 3).map((tag) => (
            <Pill
              key={tag}
              size="xxs"
              className="bg-black/5 font-semibold uppercase tracking-[0.2em] text-neutral-600 dark:bg-white/10 dark:text-white/70"
            >
              {tag}
            </Pill>
          ))}
        </div>
      </div>
      {recording.episode && (
        <Pill
          size="xxs"
          className="absolute right-3 top-3 bg-black/60 font-semibold uppercase tracking-[0.18em] text-white shadow"
        >
          {recording.episodeNumber
            ? `${labels.epShort} ${recording.episodeNumber}`
            : recording.episode}
        </Pill>
      )}
    </Link>
  );
}

function RecordingRail({
  title,
  recordings,
  locale,
  labels,
}: {
  title: string;
  recordings: CatalogRecording[];
  locale: string;
  labels: RecordingsCatalogLabels;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (direction: number) => {
    if (!railRef.current) return;
    railRef.current.scrollBy({
      left: direction * railRef.current.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AccentBar />
          <h3 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
            {title}
          </h3>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Scroll left"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:ring-white/10 dark:hover:bg-neutral-800"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Scroll right"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-neutral-100 dark:bg-neutral-900 dark:text-white dark:ring-white/10 dark:hover:bg-neutral-800"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="relative rounded-[28px] bg-white/60 px-2 pt-2 pb-2 dark:bg-neutral-950/60">
        <div
          ref={railRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth"
        >
          {recordings.map((recording) => (
            <RecordingRailCard
              key={`${recording.shortId}-${title}`}
              recording={recording}
              locale={locale}
              labels={labels}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 rounded-[28px] bg-gradient-to-r from-white/60 to-transparent dark:from-neutral-950/60" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-10 rounded-[28px] bg-gradient-to-l from-white/60 to-transparent dark:from-neutral-950/60" />
      </div>
    </div>
  );
}

export function RecordingsCatalog({
  recordings,
  labels,
  locale,
}: {
  recordings: CatalogRecording[];
  labels: RecordingsCatalogLabels;
  locale: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeLocation, setActiveLocation] = useState<LocationFilter>("all");
  const [activeTag, setActiveTag] = useState("all");
  const [activeEpisode, setActiveEpisode] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFiltering, setIsFiltering] = useState(false);
  const isFirstFilter = useRef(true);
  const [viewMode, setViewMode] = useState<"rows" | "grid">("rows");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [isFeaturedPaused, setIsFeaturedPaused] = useState(false);
  const [canHover, setCanHover] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);
  useEffect(() => {
    const handleVisibility = () => {
      setIsPageVisible(document.visibilityState === "visible");
    };
    handleVisibility();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);
  const featuredStartRef = useRef(0);
  const featuredRemainingRef = useRef(FEATURED_INTERVAL_MS);
  const isAutoPlayPaused = isFeaturedPaused || !isPageVisible;

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
    const map = new Map<string, { number?: number; location: LocationValue; title: string }>();
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
    setActiveLocation(normalizedLocation);
    setActiveTag(normalizedTag);
    setActiveEpisode(normalizedEpisode);
    setSearchQuery(normalizedQuery);
  }, [searchParams, tagOptions, episodeOptions]);

  const updateFilters = (location: LocationFilter, tag: string, episode: string, search = "") => {
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
    if (!search.trim()) {
      params.delete("q");
    } else {
      params.set("q", search.trim());
    }
    const queryString = params.toString();
    router.replace(queryString ? `/library?${queryString}` : "/library");
  };

  const filteredRecordings = useMemo(() => {
    const loweredQuery = normalizeText(searchQuery.trim());
    return recordings.filter((recording) => {
      const matchesLocation = activeLocation === "all" || recording.location === activeLocation;
      const matchesTag = activeTag === "all" || recording.tags.includes(activeTag);
      const matchesEpisode = activeEpisode === "all" || recording.episodeId === activeEpisode;
      const matchesQuery =
        loweredQuery.length === 0 ||
        normalizeText(recording.title).includes(loweredQuery) ||
        recording.speaker.some((name) => normalizeText(name).includes(loweredQuery)) ||
        recording.tags.some((tag) => normalizeText(tag).includes(loweredQuery)) ||
        normalizeText(recording.location).includes(loweredQuery) ||
        (recording.episode ? normalizeText(recording.episode).includes(loweredQuery) : false) ||
        (recording.description
          ? normalizeText(recording.description).includes(loweredQuery)
          : false);
      return matchesLocation && matchesTag && matchesEpisode && matchesQuery;
    });
  }, [recordings, activeLocation, activeTag, activeEpisode, searchQuery]);

  const filterKey = `${activeLocation}-${activeTag}-${activeEpisode}-${searchQuery}`;
  const hasActiveFilters =
    activeLocation !== "all" ||
    activeTag !== "all" ||
    activeEpisode !== "all" ||
    searchQuery.trim() !== "";

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
    setFeaturedIndex(0);
  }, [filterKey, viewMode]);

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
  const featured = featuredCandidates[featuredIndex] ?? featuredCandidates[0];
  const hasFeaturedHero = Boolean(featured?.featureHeroThumbnail);
  const featuredThumbnail = hasFeaturedHero ? featured?.featureHeroThumbnail : featured?.thumbnail;
  const gridRecordings = filteredRecordings;

  useEffect(() => {
    if (viewMode !== "rows" || featuredCandidates.length <= 1) return;
    featuredRemainingRef.current = FEATURED_INTERVAL_MS;
    featuredStartRef.current = performance.now();
  }, [featuredIndex, viewMode, featuredCandidates.length]);

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

  useEffect(() => {
    if (viewMode !== "rows" || featuredCandidates.length <= 1) return;

    if (isAutoPlayPaused) {
      const elapsed = performance.now() - featuredStartRef.current;
      featuredRemainingRef.current = Math.max(FEATURED_INTERVAL_MS - elapsed, 0);
      return;
    }

    featuredStartRef.current =
      performance.now() - (FEATURED_INTERVAL_MS - featuredRemainingRef.current);

    const timer = setTimeout(() => {
      featuredRemainingRef.current = FEATURED_INTERVAL_MS;
      setFeaturedIndex((prev) => (prev + 1) % featuredCandidates.length);
    }, featuredRemainingRef.current);

    return () => clearTimeout(timer);
  }, [featuredIndex, featuredCandidates.length, viewMode, isAutoPlayPaused]);

  const tagRows = useMemo(() => {
    if (activeTag !== "all") {
      return [];
    }

    const counts = new Map<string, number>();
    filteredRecordings.forEach((recording) => {
      recording.tags.forEach((tag) => {
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

        {viewMode === "grid" ? (
          <div className="glass mb-8 rounded-2xl px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
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
                        updateFilters(option.value, activeTag, activeEpisode, searchQuery);
                      }}
                      variant="plain"
                      size="sm"
                      className={`rounded-full font-medium transition ${
                        activeLocation === option.value
                          ? option.value === LOCATIONS.PRAGUE
                            ? "bg-red-500 text-white shadow-sm shadow-red-500/25"
                            : option.value === LOCATIONS.ZLIN
                              ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25"
                              : "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
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
                <select
                  value={activeTag}
                  onChange={(e) => {
                    updateFilters(activeLocation, e.target.value, activeEpisode, searchQuery);
                  }}
                  className={`w-40 appearance-none rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-8 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
                    activeTag !== "all"
                      ? "text-brand-600 dark:text-brand-300"
                      : "text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  <option value="all">{labels.filters.allTags}</option>
                  {tagOptions
                    .filter((tag) => tag !== "all")
                    .map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
              </div>

              <div className="relative">
                <select
                  value={activeEpisode}
                  onChange={(e) => {
                    updateFilters(activeLocation, activeTag, e.target.value, searchQuery);
                  }}
                  className={`w-64 appearance-none rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-8 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
                    activeEpisode !== "all"
                      ? "text-brand-600 dark:text-brand-300"
                      : "text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  <option value="all">{labels.filters.allEpisodes}</option>
                  {groupedEpisodes.map((group) => (
                    <optgroup
                      key={group.label}
                      label={group.label}
                      className="font-semibold text-neutral-900 dark:text-white"
                    >
                      {group.options.map((episode) => (
                        <option
                          key={episode.value}
                          value={episode.value}
                          className="font-normal text-neutral-600 dark:text-neutral-300"
                        >
                          {episode.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
              </div>

              <div className="relative flex-1">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => {
                    const next = e.target.value;
                    setSearchQuery(next);
                    updateFilters(activeLocation, activeTag, activeEpisode, next);
                  }}
                  placeholder={labels.search.placeholder}
                  aria-label={labels.search.label}
                  className="w-full min-w-[220px] rounded-lg border-0 bg-white/90 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm ring-1 ring-black/5 transition placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:placeholder:text-neutral-500 dark:focus:ring-brand-400/50"
                />
              </div>

              <Button
                onClick={() => {
                  updateFilters("all", "all", "all", "");
                }}
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
                onClick={() => {
                  setViewMode("rows");
                  updateFilters("all", "all", "all", "");
                }}
                variant="plain"
                size="sm"
                className="ml-auto w-full rounded-lg bg-white/80 font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white sm:w-auto dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-white/15"
              >
                {labels.view.rows}
              </Button>
            </div>
          </div>
        ) : null}

        {viewMode === "grid" && <div className="section-divider mb-8" />}

        <div
          className={`min-h-[700px] transition-opacity duration-300 ${
            isFiltering ? "opacity-70" : "opacity-100"
          }`}
        >
          {filteredRecordings.length === 0 ? (
            (() => {
              const notRecordedEpisode =
                activeEpisode !== "all" && UNRECORDED_EPISODES.has(activeEpisode)
                  ? getEpisodeById(activeEpisode)
                  : undefined;
              if (notRecordedEpisode) {
                const episodeLabel = notRecordedEpisode.number
                  ? `${labels.epShort} ${notRecordedEpisode.number} — ${notRecordedEpisode.title}`
                  : notRecordedEpisode.title;
                return (
                  <div className="mx-auto max-w-2xl recording-card-enter rounded-[28px] bg-white/90 p-10 text-center shadow-xl shadow-black/5 ring-1 ring-black/5 dark:bg-neutral-950 dark:shadow-black/20 dark:ring-white/10">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-300">
                      <InfoIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                      {labels.notRecorded.title}
                    </h3>
                    <p className="mt-3 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
                      {labels.notRecorded.body.replace("{episode}", episodeLabel)}
                    </p>
                    <div className="mt-6 flex justify-center">
                      <Button
                        onClick={() => updateFilters("all", "all", "all", "")}
                        variant="primary"
                        size="sm"
                      >
                        {labels.notRecorded.cta}
                      </Button>
                    </div>
                  </div>
                );
              }
              return (
                <EmptyState
                  message={labels.empty}
                  className="max-w-lg p-12 recording-card-enter"
                  messageClassName="text-lg text-neutral-600 dark:text-neutral-300"
                />
              );
            })()
          ) : (
            <>
              {viewMode === "rows" && featured && (
                <>
                  <article
                    key={`featured-${featured.shortId}-${filterKey}`}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/watch/${featured.slug}-${featured.shortId}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/watch/${featured.slug}-${featured.shortId}`);
                      }
                    }}
                    aria-label={featured.title}
                    onMouseEnter={canHover ? () => setIsFeaturedPaused(true) : undefined}
                    onMouseLeave={canHover ? () => setIsFeaturedPaused(false) : undefined}
                    className={`group recording-card-enter relative mb-8 block cursor-pointer overflow-hidden rounded-[32px] bg-white/90 text-neutral-900 shadow-xl shadow-black/10 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/20 dark:ring-white/10 ${
                      hasFeaturedHero ? "min-h-[420px] sm:min-h-0" : ""
                    }`}
                  >
                    <div
                      className={
                        hasFeaturedHero
                          ? "absolute inset-0 z-0 sm:relative sm:aspect-[16/7] sm:w-full"
                          : "relative aspect-[16/7] w-full"
                      }
                    >
                      <Image
                        src={featuredThumbnail ?? featured.thumbnail}
                        alt={featured.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 70vw"
                        priority
                      />
                      {viewMode === "rows" && featuredCandidates.length > 1 ? (
                        <div className="absolute inset-0 z-10 pointer-events-none">
                          <button
                            type="button"
                            aria-label="Previous featured"
                            onClick={(event) => {
                              event.stopPropagation();
                              setIsFeaturedPaused(false);
                              setFeaturedIndex(
                                (prev) =>
                                  (prev - 1 + featuredCandidates.length) %
                                  featuredCandidates.length,
                              );
                            }}
                            className="pointer-events-auto absolute inset-y-0 left-0 w-1/5 cursor-pointer"
                          />
                          <button
                            type="button"
                            aria-label="Next featured"
                            onClick={(event) => {
                              event.stopPropagation();
                              setIsFeaturedPaused(false);
                              setFeaturedIndex((prev) => (prev + 1) % featuredCandidates.length);
                            }}
                            className="pointer-events-auto absolute inset-y-0 right-0 w-1/5 cursor-pointer"
                          />
                        </div>
                      ) : null}
                      {viewMode === "rows" && featuredCandidates.length > 1 ? (
                        <div className="absolute top-4 left-6 right-6 z-10 flex gap-2">
                          {featuredCandidates.map((item, index) => {
                            const isActive = index === featuredIndex;
                            return (
                              <div
                                key={`progress-${item.shortId}`}
                                className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/40 dark:bg-white/20"
                              >
                                <span
                                  key={
                                    isActive
                                      ? `active-${item.shortId}-${featuredIndex}`
                                      : `inactive-${item.shortId}`
                                  }
                                  className={`block h-full rounded-full ${
                                    isActive
                                      ? "hero-progress-fill"
                                      : index < featuredIndex
                                        ? "bg-white"
                                        : "bg-white/20"
                                  }`}
                                  style={
                                    isActive
                                      ? {
                                          animationDuration: `${FEATURED_INTERVAL_MS}ms`,
                                          animationPlayState: isAutoPlayPaused
                                            ? "paused"
                                            : "running",
                                        }
                                      : index < featuredIndex
                                        ? { width: "100%" }
                                        : { width: "0%" }
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 z-20 sm:bottom-6 sm:left-6 sm:right-6">
                      <div
                        className={`flex max-w-2xl flex-col gap-2 rounded-3xl px-4 py-4 sm:px-5 sm:py-4 ${
                          hasFeaturedHero
                            ? "bg-black/60 text-white ring-1 ring-white/10 sm:bg-white/90 sm:text-neutral-900 sm:ring-black/5 dark:sm:bg-black/60 dark:sm:text-white dark:sm:ring-white/10"
                            : "bg-white/85 text-neutral-900 ring-1 ring-black/5 dark:bg-black/60 dark:text-white dark:ring-white/10"
                        }`}
                      >
                        <div
                          className={`flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] ${
                            hasFeaturedHero
                              ? "text-white/80 sm:text-neutral-600 dark:sm:text-white/70"
                              : "text-neutral-600 dark:text-white/70"
                          }`}
                        >
                          <Pill
                            size="xs"
                            className={`${
                              hasFeaturedHero
                                ? "bg-white/15 text-white/90 sm:bg-black/5 sm:text-neutral-700 dark:sm:bg-white/10 dark:sm:text-white/80"
                                : "bg-black/5 text-neutral-700 dark:bg-white/10 dark:text-white/80"
                            }`}
                          >
                            {featured.location}
                          </Pill>
                          <span>{formatDate(featured.date, locale)}</span>
                        </div>
                        <h2
                          className={`break-words text-xl font-semibold leading-tight line-clamp-2 sm:text-3xl lg:text-4xl ${
                            hasFeaturedHero
                              ? "text-white sm:text-neutral-900 dark:sm:text-white"
                              : "text-neutral-900 dark:text-white"
                          }`}
                        >
                          {featured.title}
                        </h2>
                        <div className="flex flex-col gap-1.5">
                          {featured.speaker.map((name) => (
                            <div key={name} className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] dark:bg-brand-400" />
                              <span
                                className={`text-xs font-medium sm:text-sm ${
                                  hasFeaturedHero
                                    ? "text-white/90 sm:text-neutral-900/80 dark:sm:text-white/80"
                                    : "text-neutral-900/80 dark:text-white/80"
                                }`}
                              >
                                {name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <p
                          className={`text-xs sm:text-base ${
                            hasFeaturedHero
                              ? "text-white/70 sm:text-neutral-600 dark:sm:text-white/70"
                              : "text-neutral-600 dark:text-white/70"
                          }`}
                        >
                          {featured.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {featured.tags.map((tag) => (
                            <Pill
                              key={tag}
                              href={`/library?tag=${encodeURIComponent(tag)}`}
                              onClick={(event) => event.stopPropagation()}
                              size="xs"
                              className={`font-semibold transition hover:text-neutral-900 dark:hover:text-white ${
                                hasFeaturedHero
                                  ? "bg-white/10 text-white/75 sm:bg-black/5 sm:text-neutral-600 dark:sm:bg-white/10 dark:sm:text-white/70"
                                  : "bg-black/5 text-neutral-600 dark:bg-white/10 dark:text-white/70"
                              }`}
                            >
                              {tag}
                            </Pill>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
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
                    {rows.map((row) => (
                      <RecordingRail
                        key={`${row.key}-${filterKey}`}
                        title={row.title}
                        recordings={row.items}
                        locale={locale}
                        labels={labels}
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
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {gridRecordings.map((recording) => (
                    <article
                      key={`${recording.shortId}-${filterKey}`}
                      role="link"
                      tabIndex={0}
                      onClick={() => router.push(`/watch/${recording.slug}-${recording.shortId}`)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          router.push(`/watch/${recording.slug}-${recording.shortId}`);
                        }
                      }}
                      aria-label={recording.title}
                      className="group relative flex flex-col cursor-pointer overflow-hidden rounded-[28px] bg-white/90 text-neutral-900 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10"
                    >
                      <div className="relative aspect-video shrink-0">
                        <Image
                          src={recording.thumbnail}
                          alt={recording.title}
                          fill
                          className="object-cover transition duration-700 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </div>
                      <div className="flex flex-1 flex-col space-y-3 bg-white/85 px-5 pb-6 pt-5 text-neutral-900 dark:bg-black/75 dark:text-white">
                        <RecordingMeta
                          location={recording.location}
                          date={recording.date}
                          locale={locale}
                          trackingClass="tracking-[0.25em]"
                        />
                        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-neutral-900 dark:text-white">
                          {recording.title}
                        </h3>
                        <SpeakerList speakers={recording.speaker} />
                        <div className="flex flex-wrap gap-2">
                          {recording.tags.map((tag) => (
                            <Pill
                              key={tag}
                              href={`/library?tag=${encodeURIComponent(tag)}`}
                              onClick={(event) => event.stopPropagation()}
                              size="xxs"
                              className="bg-black/5 font-semibold uppercase tracking-[0.2em] text-neutral-600 transition hover:text-neutral-900 dark:bg-white/10 dark:text-white/70 dark:hover:text-white"
                            >
                              {tag}
                            </Pill>
                          ))}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {!UNRECORDED_EPISODES.has(activeEpisode) && (
          <div className="mt-20 flex justify-center">
            <div className="glass-card relative inline-flex items-center gap-4 px-6 py-4 transition-none hover:scale-100!">
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
}
