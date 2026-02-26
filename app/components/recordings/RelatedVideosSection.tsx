import type { RelatedRecording } from "./RecordingPlayer";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { LocationPill } from "../locations/LocationPill";
import { PlayIcon } from "../shared/Icons";

import { RecordingAccessPill } from "./RecordingAccessPill";
import { RecordingCompactCard } from "./RecordingCompactCard";
import { RecordingEpisodePill } from "./RecordingEpisodePill";
import { RecordingImage } from "./RecordingImage";

interface RelatedVideosSectionProps {
  relatedRecordings: RelatedRecording[];
}

export function RelatedVideosSection({ relatedRecordings }: RelatedVideosSectionProps) {
  const t = useTranslations("recordings");
  const nextUp = relatedRecordings[0];
  const remainingRelated = relatedRecordings.slice(1);

  return (
    <section className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div className="flex items-center gap-4 lg:gap-3">
        <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 lg:text-left dark:text-white">
          {t("relatedTitle")}
        </h2>
        <div className="h-px flex-1 bg-neutral-200/50 lg:hidden dark:bg-white/10" />
      </div>

      {nextUp ? (
        <Link
          href={PAGE_ROUTES.WATCH(nextUp.slug, nextUp.shortId)}
          prefetch={false}
          className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 p-3 shadow-lg shadow-black/5 transition hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-xl dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/20 dark:hover:border-white/20"
        >
          <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-900">
            <RecordingImage
              src={nextUp.thumbnail}
              alt={nextUp.title}
              className="!aspect-video !w-28 !rounded-xl"
              imgClassName="group-hover:scale-105"
              sizes="112px"
              loading="lazy"
              fetchPriority="low"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold tracking-[0.2em] text-neutral-700 uppercase shadow-sm">
              <PlayIcon className="h-3 w-3" />
              {t("nextUp")}
            </div>
          </div>
          <div className="min-w-0">
            <p className="group-hover:text-brand-500 dark:group-hover:text-brand-400 line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-white">
              {nextUp.title}
            </p>
          </div>
        </Link>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
        {remainingRelated.map((related, index) => (
          <RecordingCompactCard
            key={related.shortId}
            shortId={related.shortId}
            slug={related.slug}
            title={related.title}
            thumbnail={related.thumbnail}
            speaker={related.speaker}
            access={related.access}
            showInlineAccessPill={false}
            staggerIndex={index}
            footer={
              <div className="flex w-full items-center justify-between gap-2">
                <RecordingEpisodePill
                  episode={related.episode}
                  episodeNumber={related.episodeNumber}
                  epShortLabel={t("epShort")}
                  fallbackLabel={t("special")}
                  asText
                  className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase"
                />
                <div className="flex items-center gap-1.5">
                  <RecordingAccessPill access={related.access} className="px-2 py-0.5 text-[9px]" />
                  <LocationPill location={related.location} size="xxs" className="!text-[9px]" />
                </div>
              </div>
            }
          />
        ))}
      </div>
    </section>
  );
}
