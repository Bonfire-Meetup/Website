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

type CatalogRecording = Pick<
  Recording,
  | "shortId"
  | "slug"
  | "title"
  | "speaker"
  | "date"
  | "thumbnail"
  | "description"
  | "tags"
  | "location"
  | "episode"
  | "episodeNumber"
>;

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
  disclaimer: string;
  noteLabel: string;
  epShort: string;
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

export function RecordingsCatalog({
  recordings,
  title,
  subtitle,
  labels,
  locale,
}: {
  recordings: CatalogRecording[];
  title: string;
  subtitle: string;
  labels: RecordingsCatalogLabels;
  locale: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeLocation, setActiveLocation] = useState<LocationFilter>("all");
  const [activeTag, setActiveTag] = useState("all");
  const [activeEpisode, setActiveEpisode] = useState("all");

  const tagOptions = useMemo(() => {
    const filteredForTags = recordings.filter(
      (r) =>
        (activeLocation === "all" || r.location === activeLocation) &&
        (activeEpisode === "all" || r.episode === activeEpisode),
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
    const map = new Map<string, { number?: number; location: LocationValue }>();
    filteredForEpisodes.forEach((recording) => {
      if (recording.episode) {
        if (!map.has(recording.episode)) {
          map.set(recording.episode, {
            number: recording.episodeNumber,
            location: recording.location,
          });
        }
      }
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      value: name,
      label: data.number ? `${labels.epShort} ${data.number} — ${name}` : name,
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
    router.replace(query ? `/library?${query}` : "/library");
  };

  const filteredRecordings = useMemo(() => {
    return recordings.filter((recording) => {
      const matchesLocation = activeLocation === "all" || recording.location === activeLocation;
      const matchesTag = activeTag === "all" || recording.tags.includes(activeTag);
      const matchesEpisode = activeEpisode === "all" || recording.episode === activeEpisode;
      return matchesLocation && matchesTag && matchesEpisode;
    });
  }, [recordings, activeLocation, activeTag, activeEpisode]);

  const filterKey = `${activeLocation}-${activeTag}-${activeEpisode}`;

  const featured = filteredRecordings[0];
  const gridRecordings = featured
    ? filteredRecordings.filter((recording) => recording.shortId !== featured.shortId)
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
                      (activeEpisode === "all" || r.episode === activeEpisode),
                  );

                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (!hasResults && activeLocation !== option.value) return;
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
                        : !hasResults
                          ? "cursor-not-allowed bg-neutral-100 text-neutral-400 opacity-50 dark:bg-white/5 dark:text-neutral-600"
                          : "bg-white/80 text-neutral-600 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/15"
                    }`}
                  >
                    {labels.filters[option.labelKey]}
                  </button>
                );
              })}
            </div>

            <div className="hidden h-5 w-px bg-neutral-300/60 sm:block dark:bg-white/10" />

            <div className="relative">
              <select
                value={activeTag}
                onChange={(e) => {
                  setActiveTag(e.target.value);
                  updateFilters(activeLocation, e.target.value, activeEpisode);
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
                  setActiveEpisode(e.target.value);
                  updateFilters(activeLocation, activeTag, e.target.value);
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

        <div className="min-h-[800px] transition-all duration-500">
          {filteredRecordings.length === 0 ? (
            <div className="glass-card mx-auto max-w-lg p-12 text-center recording-card-enter">
              <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
                {labels.empty}
              </p>
            </div>
          ) : (
            <>
              {featured && (
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
                  className="group recording-card-enter relative mb-12 block cursor-pointer overflow-hidden rounded-[32px] bg-white/90 text-neutral-900 shadow-2xl shadow-black/10 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/20 dark:ring-white/10"
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
                        <span>{formatDate(featured.date, locale)}</span>
                      </div>
                      <h2 className="max-w-2xl text-2xl font-semibold leading-tight text-neutral-900 dark:text-white sm:text-3xl lg:text-4xl">
                        {featured.title}
                      </h2>
                      <div className="mt-4 flex flex-col gap-2">
                        {featured.speaker.map((name) => (
                          <div key={name} className="flex items-center gap-2.5">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(59,130,246,0.4)] dark:bg-brand-400" />
                            <span className="text-sm font-medium text-neutral-900/80 dark:text-white/80">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 max-w-2xl text-sm text-neutral-600 dark:text-white/70 sm:text-base">
                        {featured.description}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {featured.tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/library?tag=${encodeURIComponent(tag)}`}
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
                {gridRecordings.map((recording, index) => (
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
                    className={`group recording-card-enter opacity-0 stagger-${(index % 8) + 1} relative flex flex-col cursor-pointer overflow-hidden rounded-[28px] bg-white/90 text-neutral-900 shadow-xl shadow-black/5 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10`}
                  >
                    <div className="relative aspect-video shrink-0">
                      <Image
                        src={recording.thumbnail}
                        alt={recording.title}
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent dark:from-black/90 dark:via-black/40" />
                    </div>
                    <div className="flex flex-1 flex-col space-y-3 bg-white/85 px-5 pb-6 pt-5 text-neutral-900 backdrop-blur dark:bg-black/75 dark:text-white">
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-neutral-600 dark:text-white/70">
                        <span className="rounded-full bg-black/5 px-2.5 py-1 text-neutral-700 dark:bg-white/10 dark:text-white/80">
                          {recording.location}
                        </span>
                        <span className="text-neutral-400 dark:text-white/50">•</span>
                        <span>{formatDate(recording.date, locale)}</span>
                      </div>
                      <h3 className="line-clamp-2 text-base font-semibold leading-snug text-neutral-900 dark:text-white">
                        {recording.title}
                      </h3>
                      <div className="flex flex-col gap-1.5">
                        {recording.speaker.map((name) => (
                          <div key={name} className="flex items-center gap-2">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-brand-500 shadow-[0_0_6px_rgba(59,130,246,0.4)] dark:bg-brand-400" />
                            <span className="text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recording.tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/library?tag=${encodeURIComponent(tag)}`}
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

        <div className="mt-20 flex justify-center">
          <div className="glass-card relative inline-flex items-center gap-4 px-6 py-4 transition-none hover:scale-100!">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-400">
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                />
              </svg>
            </div>
            <p className="max-w-4xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              <span className="mr-1.5 font-semibold text-neutral-900 dark:text-white">
                {labels.noteLabel}
              </span>
              {labels.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
