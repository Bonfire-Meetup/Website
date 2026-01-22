import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { InfoIcon } from "../shared/icons";
import { getEpisodeById } from "@/lib/recordings/episodes";
import { UNRECORDED_EPISODES } from "./RecordingsCatalogTypes";
import type { RecordingsCatalogLabels } from "./RecordingsCatalogTypes";

export function EmptyStateMessage({
  activeEpisode,
  labels,
  onReset,
}: {
  activeEpisode: string;
  labels: RecordingsCatalogLabels;
  onReset: () => void;
}) {
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
          <Button onClick={onReset} variant="primary" size="sm">
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
}
