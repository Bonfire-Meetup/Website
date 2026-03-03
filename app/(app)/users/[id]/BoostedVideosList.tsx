"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { RecordingDetailedCard } from "@/components/recordings/RecordingDetailedCard";
import { BoltIcon, ChevronDownIcon } from "@/components/shared/Icons";
import type { CatalogRecording } from "@/lib/recordings/catalog-types";

const INITIAL_DISPLAY_COUNT = 6;

interface BoostedVideosListProps {
  recordings: CatalogRecording[];
  locale: string;
  badgeLabel: string;
}

export function BoostedVideosList({ recordings, locale, badgeLabel }: BoostedVideosListProps) {
  const t = useTranslations("account.userProfile.boosted");
  const [expanded, setExpanded] = useState(false);
  const hasMore = recordings.length > INITIAL_DISPLAY_COUNT;
  const displayedItems = expanded ? recordings : recordings.slice(0, INITIAL_DISPLAY_COUNT);
  const hiddenCount = recordings.length - INITIAL_DISPLAY_COUNT;
  const showMoreLabel = t("showMore", { count: hiddenCount });
  const showFewerLabel = t("showFewer");

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {displayedItems.map((recording, index) => (
          <RecordingDetailedCard
            key={recording.shortId}
            variant="grid"
            shortId={recording.shortId}
            slug={recording.slug}
            title={recording.title}
            speaker={recording.speaker}
            date={recording.date}
            thumbnail={recording.thumbnail}
            location={recording.location}
            tags={recording.tags ?? []}
            episode={recording.episode}
            episodeNumber={recording.episodeNumber}
            access={recording.access}
            isFirst={index < 8}
            locale={locale}
            badge={{
              icon: <BoltIcon className="h-3 w-3" aria-hidden="true" />,
              label: badgeLabel,
              gradient: "bg-emerald-500/90 backdrop-blur-sm",
            }}
          />
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 bg-white/80 px-4 py-2 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-neutral-900 focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/10 dark:bg-neutral-800/50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronDownIcon className="h-4 w-4 rotate-180" aria-hidden="true" />
                {showFewerLabel}
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
                {showMoreLabel}
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
