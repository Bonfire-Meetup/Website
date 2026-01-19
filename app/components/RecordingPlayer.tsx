"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { Recording } from "../lib/recordings";

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
      />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
      />
    </svg>
  );
}

function CinemaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
    </svg>
  );
}

function ExitCinemaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
      />
    </svg>
  );
}

interface RecordingPlayerLabels {
  backToLibrary: string;
  exitCinema: string;
  cinema: string;
  speaker: string;
  date: string;
  about: string;
  relatedTitle: string;
  back: string;
  epShort: string;
  special: string;
}

type RelatedRecording = Pick<
  Recording,
  "shortId" | "slug" | "title" | "thumbnail" | "speaker" | "episode" | "episodeNumber" | "location"
>;

export function RecordingPlayer({
  recording,
  relatedRecordings,
  labels,
  locale,
}: {
  recording: Recording;
  relatedRecordings: RelatedRecording[];
  labels: RecordingPlayerLabels;
  locale: string;
}) {
  const [cinemaMode, setCinemaMode] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [recording.youtubeId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && cinemaMode) {
        setCinemaMode(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cinemaMode]);

  const formattedDate = new Date(recording.date).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="gradient-bg min-h-screen">
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 transition-all duration-500 ${
          cinemaMode ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setCinemaMode(false)}
      >
        <button
          type="button"
          onClick={() => setCinemaMode(false)}
          className={`absolute right-4 top-4 z-10 flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white ${
            cinemaMode ? "translate-y-0 opacity-100 delay-200" : "-translate-y-4 opacity-0"
          }`}
        >
          <ExitCinemaIcon className="h-4 w-4" />
          {labels.exitCinema}
        </button>
        <div
          className={`relative aspect-video transition-all duration-500 ease-out ${
            cinemaMode ? "w-[90vw] scale-100 opacity-100" : "w-[60vw] scale-95 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <iframe
            src={`https://www.youtube.com/embed/${recording.youtubeId}?rel=0&modestbranding=1`}
            title={recording.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 h-full w-full rounded-lg"
          />
        </div>
      </div>
      <div className="relative mx-auto px-4 py-6 sm:px-6 lg:px-8" style={{ maxWidth: "85rem" }}>
        <div className="flex flex-col gap-12">
          <div className="min-w-0 space-y-8">
            <div className="glass-card no-hover-pop overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-200/30 px-4 py-3 dark:border-neutral-700/30">
                <Link
                  href={`/library?location=${recording.location}`}
                  className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                >
                  <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                  <span className="hidden sm:inline">{labels.backToLibrary}</span>
                  <span className="sm:hidden">{labels.back}</span>
                </Link>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCinemaMode(true)}
                    className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <CinemaIcon className="h-3.5 w-3.5" />
                    {labels.cinema}
                  </button>
                </div>
              </div>

              <div className="relative w-full bg-black aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${recording.youtubeId}?rel=0&modestbranding=1`}
                  title={recording.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>

              <div>
                <div className="px-5 py-5 sm:px-6 sm:py-6">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-[1.75rem] dark:text-white">
                        {recording.title}
                      </h1>
                    </div>
                    {recording.episode && (
                      <Link
                        href={`/library?episode=${encodeURIComponent(recording.episode)}`}
                        className="shrink-0 rounded-full bg-neutral-900/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 transition hover:bg-neutral-900/10 hover:text-neutral-700 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                      >
                        {recording.episodeNumber
                          ? `${labels.epShort} ${recording.episodeNumber} · ${recording.episode}`
                          : recording.episode}
                      </Link>
                    )}
                  </div>

                  <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                      <span className="font-medium text-neutral-700 dark:text-neutral-200">
                        {recording.speaker.join(" & ")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinIcon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                      <span className="font-medium text-neutral-700 dark:text-neutral-200">
                        {recording.location}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/40 pt-5 dark:border-neutral-700/40">
                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {recording.description}
                    </p>

                    {recording.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {recording.tags.map((tag) => (
                          <Link
                            key={tag}
                            href={`/library?tag=${encodeURIComponent(tag)}`}
                            className="rounded-md bg-brand-50 px-2 py-1 text-[11px] font-medium text-brand-600 transition-colors hover:bg-brand-100 hover:text-brand-700 dark:bg-brand-500/10 dark:text-brand-300 dark:hover:bg-brand-500/20 dark:hover:text-brand-200"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-neutral-200/50 dark:bg-white/10" />
              <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {labels.relatedTitle}
              </h2>
              <div className="h-px flex-1 bg-neutral-200/50 dark:bg-white/10" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {relatedRecordings.map((related, index) => (
                <Link
                  key={related.shortId}
                  href={`/watch/${related.slug}-${related.shortId}`}
                  className={`group recording-card-enter opacity-0 stagger-${
                    (index % 8) + 1
                  } relative flex flex-col overflow-hidden rounded-[24px] bg-white/90 text-neutral-900 shadow-xl shadow-black/5 ring-1 ring-black/5 transition-all hover:-translate-y-1 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10`}
                >
                  <div className="relative aspect-video w-full overflow-hidden">
                    <img
                      src={related.thumbnail}
                      alt={related.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex flex-1 flex-col justify-start">
                      <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-neutral-900 group-hover:text-brand-500 transition-colors dark:text-white dark:group-hover:text-brand-400">
                        {related.title}
                      </h3>
                      <div className="mt-2 flex flex-col gap-1">
                        {related.speaker.map((name) => (
                          <div key={name} className="flex items-center gap-2">
                            <span className="h-1 w-1 shrink-0 rounded-full bg-brand-500 shadow-[0_0_4px_rgba(59,130,246,0.3)] dark:bg-brand-400" />
                            <span className="truncate text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-white/5">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                        {related.episode
                          ? related.episodeNumber
                            ? `${labels.epShort} ${related.episodeNumber}`
                            : related.episode
                          : labels.special}
                      </span>
                      <span
                        className={`location-badge ${related.location.toLowerCase()} !py-0.5 !px-1.5 !text-[9px]`}
                      >
                        {related.location}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
