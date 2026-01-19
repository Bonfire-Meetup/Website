"use client";

import Link from "next/link";
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
  backToRecordings: string;
  exitCinema: string;
  cinema: string;
  speaker: string;
  date: string;
  about: string;
}

export function RecordingPlayer({
  recording,
  labels,
}: {
  recording: Recording;
  labels: RecordingPlayerLabels;
}) {
  const [cinemaMode, setCinemaMode] = useState(false);

  const formattedDate = new Date(recording.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="gradient-bg min-h-screen">
      <div
        className="relative mx-auto px-4 py-6 transition-[max-width] duration-500 ease-out sm:px-6 lg:px-8"
        style={{ maxWidth: cinemaMode ? "100%" : "68rem" }}
      >
        {/* Unified Player Card */}
        <div className="glass-card no-hover-pop overflow-hidden transition-all duration-500 ease-out">
          {/* Video Header Bar */}
          <div className="flex items-center justify-between border-b border-neutral-200/30 px-4 py-3 dark:border-neutral-700/30">
            <Link
              href={`/recordings?location=${recording.location}`}
              className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="hidden sm:inline">{labels.backToRecordings}</span>
              <span className="sm:hidden">Back</span>
            </Link>

            <div className="flex items-center gap-3">
              <span
                className={`location-badge ${recording.location.toLowerCase()} !py-1.5 !px-3 !text-xs`}
              >
                <MapPinIcon className="h-3 w-3" />
                {recording.location}
              </span>

              <button
                type="button"
                onClick={() => setCinemaMode((prev) => !prev)}
                className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-500 transition-all hover:bg-neutral-100 hover:text-neutral-900 sm:inline-flex dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-white"
              >
                {cinemaMode ? (
                  <>
                    <ExitCinemaIcon className="h-3.5 w-3.5" />
                    {labels.exitCinema}
                  </>
                ) : (
                  <>
                    <CinemaIcon className="h-3.5 w-3.5" />
                    {labels.cinema}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Video Player */}
          <div
            className={`relative w-full bg-black transition-all duration-500 ease-out ${
              cinemaMode ? "aspect-[21/9]" : "aspect-video"
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

          {/* Metadata Section */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-out ${
              cinemaMode ? "max-h-0 opacity-0" : "max-h-[800px] opacity-100"
            }`}
          >
            <div className="px-5 py-5 sm:px-6 sm:py-6">
              {/* Title & Episode Row */}
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1">
                  <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-[1.75rem] dark:text-white">
                    {recording.title}
                  </h1>
                </div>
                {recording.episode && (
                  <Link
                    href={`/recordings?episode=${encodeURIComponent(recording.episode)}`}
                    className="shrink-0 rounded-full bg-neutral-900/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 transition hover:bg-neutral-900/10 hover:text-neutral-700 dark:bg-white/5 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {recording.episodeNumber
                      ? `Ep. ${recording.episodeNumber} · ${recording.episode}`
                      : recording.episode}
                  </Link>
                )}
              </div>

              {/* Speaker & Date - Compact Inline */}
              <div className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-500 dark:text-neutral-400">
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                  <span className="font-medium text-neutral-700 dark:text-neutral-200">
                    {recording.speaker}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-brand-500 dark:text-brand-400" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-neutral-200/40 pt-5 dark:border-neutral-700/40">
                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {recording.description}
                </p>

                {/* Tags */}
                {recording.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {recording.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/recordings?tag=${encodeURIComponent(tag)}`}
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
    </div>
  );
}
