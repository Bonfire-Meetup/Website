import { useTranslations } from "next-intl";
import Link from "next/link";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { LocationPill } from "../locations/LocationPill";
import { PlayIcon } from "../shared/Icons";

import { RecordingAccessPill } from "./RecordingAccessPill";
import { RecordingCompactCard } from "./RecordingCompactCard";
import { RecordingEpisodePill } from "./RecordingEpisodePill";
import { RecordingImage } from "./RecordingImage";
import type { RelatedRecording } from "./RecordingPlayer";

interface RelatedVideosSectionProps {
  relatedRecordings: RelatedRecording[];
}

export function RelatedVideosSection({ relatedRecordings }: RelatedVideosSectionProps) {
  const t = useTranslations("recordings");
  const nextUp = relatedRecordings[0];
  const remainingRelated = relatedRecordings.slice(1);

  return (
    <section className="space-y-6 lg:sticky lg:top-24 lg:self-start">
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t("relatedTitle")}
          </h2>
          <span className="eyebrow text-2xs rounded-full bg-black/5 px-2.5 py-1 text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
            Queue
          </span>
        </div>
      </div>

      {nextUp ? (
        <Link
          href={PAGE_ROUTES.WATCH(nextUp.slug, nextUp.shortId)}
          prefetch={false}
          className="group shadow-raised hover:shadow-raised relative flex items-center gap-4 overflow-hidden rounded-2xl border border-black/10 bg-[linear-gradient(165deg,rgba(255,255,255,0.95)_0%,rgba(255,247,237,0.92)_100%)] p-3 ring-1 ring-white/55 transition dark:border-white/12 dark:bg-[linear-gradient(165deg,rgba(24,24,27,0.98)_0%,rgba(10,10,12,0.98)_100%)] dark:ring-white/10"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.22),transparent_52%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
            <div className="eyebrow text-2xs absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-neutral-700 shadow-sm">
              <PlayIcon className="h-3 w-3" />
              {t("nextUp")}
            </div>
          </div>
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-semibold text-neutral-900 group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-300">
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
                  className="text-2xs font-medium tracking-wider text-neutral-400 uppercase"
                />
                <div className="flex items-center gap-1.5">
                  <RecordingAccessPill access={related.access} className="text-2xs px-2 py-0.5" />
                  <LocationPill location={related.location} size="xxs" className="!text-2xs" />
                </div>
              </div>
            }
          />
        ))}
      </div>
    </section>
  );
}
