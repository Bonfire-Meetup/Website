"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { Recording } from "../lib/recordings";

type LocationFilter = "all" | "Prague" | "Zlin";

const locationOptions: { value: LocationFilter; labelKey: string }[] = [
  { value: "all", labelKey: "filters.allLocations" },
  { value: "Prague", labelKey: "filters.prague" },
  { value: "Zlin", labelKey: "filters.zlin" },
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
}: {
  recordings: Recording[];
  title: string;
  subtitle: string;
}) {
  const t = useTranslations("recordingsPage");
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
    return [{ value: "all", label: t("filters.allEpisodes") }].concat(
      episodes.map(([episode, number]) => ({
        value: episode,
        label: number ? `Ep. ${number} — ${episode}` : episode,
      })),
    );
  }, [recordings, t]);

  useEffect(() => {
    const locationParam = searchParams.get("location") ?? "all";
    const tagParam = searchParams.get("tag") ?? "all";
    const episodeParam = searchParams.get("episode") ?? "all";
    const normalizedLocation =
      locationParam === "Prague" || locationParam === "Zlin" ? locationParam : "all";
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
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
            {subtitle}
          </p>
        </div>

        <div className="glass mb-10 rounded-3xl p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">
              {t("filters.title")}
            </span>
            <button
              type="button"
              onClick={() => {
                setActiveLocation("all");
                setActiveTag("all");
                setActiveEpisode("all");
                updateFilters("all", "all", "all");
              }}
              disabled={activeLocation === "all" && activeTag === "all" && activeEpisode === "all"}
              className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] transition ${
                activeLocation === "all" && activeTag === "all" && activeEpisode === "all"
                  ? "cursor-not-allowed bg-black/5 text-neutral-400 dark:bg-white/5 dark:text-neutral-500"
                  : "bg-neutral-900 text-white shadow-lg shadow-neutral-900/15 hover:shadow-neutral-900/25 dark:bg-white dark:text-neutral-900"
              }`}
            >
              {t("filters.reset")}
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5 shadow-sm shadow-black/5 dark:bg-white/5 dark:ring-white/10 dark:shadow-black/30">
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
                  {t("filters.location")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {locationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setActiveLocation(option.value);
                      updateFilters(option.value, activeTag, activeEpisode);
                    }}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      activeLocation === option.value
                        ? option.value === "Prague"
                          ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                          : option.value === "Zlin"
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                            : "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                        : "bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
                    }`}
                  >
                    {t(option.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5 shadow-sm shadow-black/5 dark:bg-white/5 dark:ring-white/10 dark:shadow-black/30">
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
                  {t("filters.tag")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {tagOptions.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setActiveTag(tag);
                      updateFilters(activeLocation, tag, activeEpisode);
                    }}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      activeTag === tag
                        ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 dark:bg-white dark:text-neutral-900"
                        : "bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
                    }`}
                  >
                    {tag === "all" ? t("filters.allTags") : tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5 shadow-sm shadow-black/5 dark:bg-white/5 dark:ring-white/10 dark:shadow-black/30">
              <div className="mb-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
                  {t("filters.episode")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {episodeOptions.map((episode) => (
                  <button
                    key={episode.value}
                    onClick={() => {
                      setActiveEpisode(episode.value);
                      updateFilters(activeLocation, activeTag, episode.value);
                    }}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                      activeEpisode === episode.value
                        ? "bg-neutral-900 text-white shadow-lg shadow-neutral-900/20 dark:bg-white dark:text-neutral-900"
                        : "bg-white text-neutral-600 hover:bg-neutral-50 dark:bg-white/10 dark:text-neutral-300 dark:hover:bg-white/20"
                    }`}
                  >
                    {episode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredRecordings.length === 0 ? (
          <div className="glass-card mx-auto max-w-lg p-12 text-center">
            <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
              {t("empty")}
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
                className="group relative mb-12 block overflow-hidden rounded-[32px] bg-white/90 text-neutral-900 shadow-2xl shadow-black/10 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/20 dark:ring-white/10"
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
                  className="group relative overflow-hidden rounded-[28px] bg-white/90 text-neutral-900 shadow-xl shadow-black/5 ring-1 ring-black/5 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10"
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
