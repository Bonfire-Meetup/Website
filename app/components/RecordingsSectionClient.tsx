"use client";

import { VideoCard } from "./VideoCard";
import { EmptyState } from "./EmptyState";
import { Button } from "./Button";
import type { Recording } from "../lib/recordings";
import { LOCATIONS } from "../lib/constants";

type Labels = {
  prague: string;
  zlin: string;
  empty: string;
  viewAll: string;
  ariaLocationLabel: string;
};

type HomepageRecording = Pick<
  Recording,
  "shortId" | "slug" | "title" | "speaker" | "date" | "thumbnail" | "location"
> & { likeCount?: number };

export function RecordingsSectionClient({
  recordings,
  labels,
  locale,
}: {
  recordings: HomepageRecording[];
  labels: Labels;
  locale: string;
}) {
  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {recordings.map((recording) => (
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
            likeCount={recording.likeCount}
          />
        ))}
      </div>

      {recordings.length === 0 && (
        <EmptyState
          message={labels.empty}
          className="max-w-md p-12"
          messageClassName="text-neutral-600 dark:text-neutral-400"
        />
      )}

      <div className="mt-16 text-center">
        <Button href="/library" variant="glass" className="inline-flex items-center gap-3">
          {labels.viewAll}
        </Button>
      </div>
    </>
  );
}
