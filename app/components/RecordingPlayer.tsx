"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
        d="M3 7.5h18M3 16.5h18M7.5 3v18M16.5 3v18"
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
        d="M4.5 9.75V4.5h5.25M19.5 9.75V4.5h-5.25M4.5 14.25v5.25h5.25M19.5 14.25v5.25h-5.25"
      />
    </svg>
  );
}

export function RecordingPlayer({ recording }: { recording: Recording }) {
  const t = useTranslations("recordings");
  const [cinemaMode, setCinemaMode] = useState(false);

  const formattedDate = new Date(recording.date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="gradient-bg min-h-screen">
      <div
        className="relative mx-auto px-4 py-8 transition-[max-width] duration-700 ease-out sm:px-6 lg:px-8"
        style={{ maxWidth: cinemaMode ? "100%" : "72rem" }}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/recordings?location=${recording.location}`}
            className="glass-button-secondary inline-flex items-center gap-2 !px-5 !py-2.5 text-sm"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t("backToRecordings")}
          </Link>

          <button
            type="button"
            onClick={() => setCinemaMode((prev) => !prev)}
            className="glass-button-secondary hidden items-center gap-2 !px-5 !py-2.5 text-sm sm:inline-flex"
          >
            {cinemaMode ? (
              <>
                <ExitCinemaIcon className="h-4 w-4" />
                {t("exitCinema")}
              </>
            ) : (
              <>
                <CinemaIcon className="h-4 w-4" />
                {t("cinema")}
              </>
            )}
          </button>
        </div>

        <div
          className={`glass-card no-hover-pop overflow-hidden p-2 transition-all duration-700 ease-out ${
            cinemaMode ? "rounded-3xl" : "mb-8"
          }`}
        >
          <div
            className={`relative w-full overflow-hidden rounded-2xl bg-black ${
              cinemaMode ? "aspect-[16/8] sm:aspect-[16/7]" : "aspect-video"
            }`}
          >
            <iframe
              src={`https://www.youtube.com/embed/${recording.id}?rel=0&modestbranding=1`}
              title={recording.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>

        <div
          className={`glass-card no-hover-pop overflow-hidden transition-all duration-700 ease-out ${
            cinemaMode ? "max-h-0 opacity-0" : "max-h-[1200px] opacity-100"
          }`}
        >
          {!cinemaMode && (
            <div className="p-8">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`location-badge ${recording.location.toLowerCase()}`}>
                  <MapPinIcon className="h-4 w-4" />
                  {recording.location}
                </span>
                {recording.episode && (
                  <Link
                    href={`/recordings?episode=${encodeURIComponent(recording.episode)}`}
                    className="rounded-full bg-neutral-900/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-600 transition hover:text-neutral-900 dark:bg-white/10 dark:text-neutral-300 dark:hover:text-white"
                  >
                    {recording.episodeNumber
                      ? `Ep. ${recording.episodeNumber} — ${recording.episode}`
                      : recording.episode}
                  </Link>
                )}
              </div>

              <h1 className="mb-6 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl lg:text-4xl dark:text-white">
                {recording.title}
              </h1>

              <div className="mb-6 flex flex-wrap gap-6">
                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100/80 dark:bg-brand-500/10">
                    <UserIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{t("speaker")}</p>
                    <p className="font-medium">{recording.speaker}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-neutral-600 dark:text-neutral-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100/80 dark:bg-brand-500/10">
                    <CalendarIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{t("date")}</p>
                    <p className="font-medium">{formattedDate}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200/50 pt-6 dark:border-neutral-700/50">
                <h2 className="mb-3 text-lg font-semibold text-neutral-900 dark:text-white">
                  {t("about")}
                </h2>
                <p className="leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {recording.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {recording.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/recordings?tag=${encodeURIComponent(tag)}`}
                      className="rounded-full bg-brand-100/70 px-3 py-1 text-xs font-semibold text-brand-700 transition hover:text-brand-900 dark:bg-brand-500/10 dark:text-brand-200 dark:hover:text-white"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
