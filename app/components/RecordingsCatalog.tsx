"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { Recording } from "../lib/recordings";

import { LOCATIONS, type LocationValue } from "../lib/constants";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

type LocationFilter = "all" | LocationValue;

interface RecordingsCatalogLabels {
  eyebrow: string;
  title: string;
  subtitle: string;
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
}

const locationOptions: {
  value: LocationFilter;
  labelKey: keyof RecordingsCatalogLabels["filters"];
}[] = [
  { value: "all", labelKey: "allLocations" },
  { value: LOCATIONS.PRAGUE, labelKey: "prague" },
  { value: LOCATIONS.ZLIN, labelKey: "zlin" },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecordingsCatalog({
  recordings,
  title,
  subtitle,
  labels,
}: {
  recordings: Recording[];
  title: string;
  subtitle: string;
  labels: RecordingsCatalogLabels;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeLocation, setActiveLocation] = useState<LocationFilter>("all");
  const [activeTag, setActiveTag] = useState("all");
  const [activeEpisode, setActiveEpisode] = useState("all");

  const tagOptions = useMemo(() => {
    const tags = Array.from(new Set(recordings.flatMap((recording) => recording.tags))).sort(
      (a, b) => a.localeCompare(b),
    );
    return ["all", ...tags];
  }, [recordings]);

  const episodeOptions = useMemo(() => {
    const map = new Map<string, number | undefined>();
    recordings.forEach((recording) => {
      if (recording.episode) {
        if (!map.has(recording.episode)) {
          map.set(recording.episode, recording.episodeNumber);
        }
      }
    });
    const episodes = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    return [{ value: "all", label: labels.filters.allEpisodes }].concat(
      episodes.map(([episode, number]) => ({
        value: episode,
        label: number ? `Ep. ${number} — ${episode}` : episode,
      })),
    );
  }, [recordings, labels.filters.allEpisodes]);

  useEffect(() => {
    const locationParam = searchParams.get("location") ?? "all";
    const tagParam = searchParams.get("tag") ?? "all";
    const episodeParam = searchParams.get("episode") ?? "all";
    const normalizedLocation =
      locationParam === LOCATIONS.PRAGUE || locationParam === LOCATIONS.ZLIN
        ? locationParam
        : "all";
    const normalizedTag = tagOptions.includes(tagParam) ? tagParam : "all";
    const normalizedEpisode = episodeOptions.some((option) => option.value === episodeParam)
      ? episodeParam
      : "all";
    setActiveLocation(normalizedLocation);
    setActiveTag(normalizedTag);
    setActiveEpisode(normalizedEpisode);
  }, [searchParams, tagOptions, episodeOptions]);

  const updateFilters = (location: LocationFilter, tag: string, episode: string) => {
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
    const query = params.toString();
    router.replace(query ? `/recordings?${query}` : "/recordings");
  };

  const filteredRecordings = useMemo(() => {
    return recordings.filter((recording) => {
      const matchesLocation = activeLocation === "all" || recording.location === activeLocation;
      const matchesTag = activeTag === "all" || recording.tags.includes(activeTag);
      const matchesEpisode = activeEpisode === "all" || recording.episode === activeEpisode;
      return matchesLocation && matchesTag && matchesEpisode;
    });
  }, [recordings, activeLocation, activeTag, activeEpisode]);

  const featured = filteredRecordings[0];
  const gridRecordings = featured
    ? filteredRecordings.filter((recording) => recording.id !== featured.id)
    : filteredRecordings;

  return (
    <section className="relative px-4 pb-24 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-brand-500/80">
            {labels.eyebrow}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        </div>

        {/* Compact Inline Filters */}
        <div className="glass mb-8 rounded-2xl px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Location Pills */}
            <div className="flex items-center gap-2">
              {locationOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setActiveLocation(option.value);
                    updateFilters(option.value, activeTag, activeEpisode);
                  }}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    activeLocation === option.value
                      ? option.value === LOCATIONS.PRAGUE
                        ? "bg-red-500 text-white shadow-sm shadow-red-500/25"
                        : option.value === LOCATIONS.ZLIN
                          ? "bg-blue-500 text-white shadow-sm shadow-blue-500/25"
                          : "bg-brand-500 text-white shadow-sm shadow-brand-500/25"
                      : "bg-white/80 text-neutral-600 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15"
                  }`}
                >
                  {labels.filters[option.labelKey]}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden h-5 w-px bg-neutral-300/60 sm:block dark:bg-white/10" />

            {/* Topic Dropdown */}
            <div className="relative">
              <select
                value={activeTag}
                onChange={(e) => {
                  setActiveTag(e.target.value);
                  updateFilters(activeLocation, e.target.value, activeEpisode);
                }}
                className={`appearance-none rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-8 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
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

            {/* Episode Dropdown */}
            <div className="relative">
              <select
                value={activeEpisode}
                onChange={(e) => {
                  setActiveEpisode(e.target.value);
                  updateFilters(activeLocation, activeTag, e.target.value);
                }}
                className={`appearance-none rounded-lg border-0 bg-white/80 py-1.5 pl-3 pr-8 text-xs font-medium shadow-sm ring-1 ring-black/5 transition focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-white/10 dark:ring-white/10 dark:focus:ring-brand-400/50 ${
                  activeEpisode !== "all"
                    ? "text-brand-600 dark:text-brand-300"
                    : "text-neutral-600 dark:text-neutral-300"
                }`}
              >
                {episodeOptions.map((episode) => (
                  <option key={episode.value} value={episode.value}>
                    {episode.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-neutral-400" />
            </div>

            {/* Reset Button - pushed to the right on desktop */}
            <button
              type="button"
              onClick={() => {
                setActiveLocation("all");
                setActiveTag("all");
                setActiveEpisode("all");
                updateFilters("all", "all", "all");
              }}
              disabled={activeLocation === "all" && activeTag === "all" && activeEpisode === "all"}
              className={`ml-auto rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeLocation === "all" && activeTag === "all" && activeEpisode === "all"
                  ? "cursor-not-allowed text-neutral-400 dark:text-neutral-500"
                  : "text-neutral-600 hover:bg-white/80 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {labels.filters.reset}
            </button>
          </div>
        </div>

        {filteredRecordings.length === 0 ? (
          <div className="glass-card mx-auto max-w-lg p-12 text-center">
            <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
              {labels.empty}
            </p>
          </div>
        ) : (
          <>
            {featured && (
              <article
                role="link"
                tabIndex={0}
                onClick={() =>
                  router.push(`/recordings/${featured.location.toLowerCase()}/${featured.slug}`)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    router.push(`/recordings/${featured.location.toLowerCase()}/${featured.slug}`);
                  }
                }}
                aria-label={featured.title}
                className="group relative mb-12 block cursor-pointer overflow-hidden rounded-[32px] bg-white/90 text-neutral-900 shadow-2xl shadow-black/10 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/20 dark:ring-white/10"
              >
                <div className="relative aspect-[16/7] w-full">
                  <Image
                    src={featured.thumbnail}
                    alt={featured.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 70vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/60 to-transparent dark:from-black/90 dark:via-black/50" />
                </div>
                <div className="absolute inset-0 flex items-end">
                  <div className="p-8 sm:p-10 lg:p-12">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-600 dark:text-white/70">
                      <span className="rounded-full bg-black/5 px-3 py-1 text-neutral-700 dark:bg-white/10 dark:text-white/80">
                        {featured.location}
                      </span>
                      <span>{formatDate(featured.date)}</span>
                    </div>
                    <h2 className="max-w-2xl text-2xl font-semibold leading-tight text-neutral-900 dark:text-white sm:text-3xl lg:text-4xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-white/70 sm:text-base">
                      {featured.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {featured.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/recordings?tag=${encodeURIComponent(tag)}`}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-neutral-600 transition hover:text-neutral-900 dark:bg-white/10 dark:text-white/70 dark:hover:text-white"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            )}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {gridRecordings.map((recording) => (
                <article
                  key={recording.id}
                  role="link"
                  tabIndex={0}
                  onClick={() =>
                    router.push(`/recordings/${recording.location.toLowerCase()}/${recording.slug}`)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      router.push(
                        `/recordings/${recording.location.toLowerCase()}/${recording.slug}`,
                      );
                    }
                  }}
                  aria-label={recording.title}
                  className="group relative cursor-pointer overflow-hidden rounded-[28px] bg-white/90 text-neutral-900 shadow-xl shadow-black/5 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={recording.thumbnail}
                      alt={recording.title}
                      fill
                      className="object-cover transition duration-700 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent dark:from-black/90 dark:via-black/40" />
                  </div>
                  <div className="space-y-3 bg-white/85 px-5 pb-6 pt-5 text-neutral-900 backdrop-blur dark:bg-black/75 dark:text-white">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-600 dark:text-white/70">
                      <span className="rounded-full bg-black/5 px-2.5 py-1 text-neutral-700 dark:bg-white/10 dark:text-white/80">
                        {recording.location}
                      </span>
                      <span className="text-neutral-400 dark:text-white/50">•</span>
                      <span>{formatDate(recording.date)}</span>
                    </div>
                    <h3 className="line-clamp-2 text-base font-semibold leading-snug text-neutral-900 dark:text-white">
                      {recording.title}
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-white/70">
                      {recording.speaker}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recording.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/recordings?tag=${encodeURIComponent(tag)}`}
                          onClick={(event) => event.stopPropagation()}
                          className="rounded-full bg-black/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-600 transition hover:text-neutral-900 dark:bg-white/10 dark:text-white/70 dark:hover:text-white"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
