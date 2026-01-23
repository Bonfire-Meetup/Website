import { useTranslations } from "next-intl";

import { getEpisodeById } from "@/lib/recordings/episodes";

import { InfoIcon } from "../shared/icons";
import { EmptyState } from "../ui/EmptyState";

import { UNRECORDED_EPISODES } from "./RecordingsCatalogTypes";
import { ResetFiltersButton } from "./ResetFiltersButton";

export function EmptyStateMessage({
  activeEpisode,
  onReset,
}: {
  activeEpisode: string;
  onReset: () => void;
}) {
  const t = useTranslations("recordings");
  const tNotRecorded = useTranslations("recordings.notRecorded");
  const notRecordedEpisode =
    activeEpisode !== "all" && UNRECORDED_EPISODES.has(activeEpisode)
      ? getEpisodeById(activeEpisode)
      : undefined;

  if (notRecordedEpisode) {
    const episodeLabel = notRecordedEpisode.number
      ? `${t("epShort")} ${notRecordedEpisode.number} - ${notRecordedEpisode.title}`
      : notRecordedEpisode.title;

    return (
      <div className="recording-card-enter mx-auto max-w-2xl rounded-[28px] bg-white/90 p-10 text-center shadow-xl ring-1 shadow-black/5 ring-black/5 dark:bg-neutral-950 dark:shadow-black/20 dark:ring-white/10">
        <div className="bg-brand-500/10 text-brand-500 dark:bg-brand-500/20 dark:text-brand-300 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <InfoIcon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
          {tNotRecorded("title")}
        </h3>
        <p className="mt-3 text-sm whitespace-pre-line text-neutral-600 dark:text-neutral-300">
          {tNotRecorded("body", { episode: episodeLabel })}
        </p>
        <div className="mt-6 flex justify-center">
          <ResetFiltersButton onClick={onReset} label={tNotRecorded("cta")} />
        </div>
      </div>
    );
  }

  return (
    <EmptyState
      message={t("empty")}
      className="recording-card-enter max-w-lg p-12"
      messageClassName="text-lg text-neutral-600 dark:text-neutral-300"
    />
  );
}
