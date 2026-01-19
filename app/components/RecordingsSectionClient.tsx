"use client";

import { useState } from "react";
import Link from "next/link";
import { VideoCard } from "./VideoCard";
import type { Recording } from "../lib/recordings";
import { LOCATIONS, type LocationValue } from "../lib/constants";

type FilterOption = "all" | LocationValue;

type Labels = {
  all: string;
  prague: string;
  zlin: string;
  empty: string;
  viewAll: string;
  ariaLocationLabel: string;
};

type HomepageRecording = Pick<
  Recording,
  "shortId" | "slug" | "title" | "speaker" | "date" | "thumbnail" | "location"
>;

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

export function RecordingsSectionClient({
  recordings,
  labels,
  locale,
}: {
  recordings: HomepageRecording[];
  labels: Labels;
  locale: string;
}) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");

  const filteredRecordings =
    activeFilter === "all" ? recordings : recordings.filter((r) => r.location === activeFilter);

  const filterOptions: { key: FilterOption; label: string; color?: string }[] = [
    { key: "all", label: labels.all },
    { key: LOCATIONS.PRAGUE, label: labels.prague, color: "red" },
    { key: LOCATIONS.ZLIN, label: labels.zlin, color: "blue" },
  ];

  return (
    <>
      <div className="mb-10 flex justify-center">
        <div className="glass inline-flex items-center gap-1 rounded-2xl p-1.5">
          {filterOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setActiveFilter(option.key)}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-300 ${
                activeFilter === option.key
                  ? option.color === "red"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/25"
                    : option.color === "blue"
                      ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-brand-500 text-white shadow-lg shadow-brand-500/25"
                  : "text-neutral-600 hover:bg-white/50 dark:text-neutral-400 dark:hover:bg-white/10"
              }`}
            >
              {option.key !== "all" && <MapPinIcon className="h-4 w-4" />}
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRecordings.map((recording) => (
          <VideoCard
            key={recording.shortId}
            shortId={recording.shortId}
            slug={recording.slug}
            title={recording.title}
            speaker={recording.speaker}
            date={recording.date}
            thumbnail={recording.thumbnail}
            location={recording.location}
            locationLabel={recording.location === LOCATIONS.PRAGUE ? labels.prague : labels.zlin}
            ariaLocationLabel={labels.ariaLocationLabel.replace("{location}", recording.location)}
            locale={locale}
          />
        ))}
      </div>

      {filteredRecordings.length === 0 && (
        <div className="glass-card mx-auto max-w-md p-12 text-center">
          <p className="text-neutral-600 dark:text-neutral-400">{labels.empty}</p>
        </div>
      )}

      <div className="mt-16 text-center">
        <Link href="/library" className="glass-button inline-flex items-center gap-3">
          {labels.viewAll}
        </Link>
      </div>
    </>
  );
}
