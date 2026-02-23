import type { RelatedRecording } from "./RecordingPlayer";
import { useTranslations } from "next-intl";

import { LocationPill } from "../locations/LocationPill";

import { RecordingCompactCard } from "./RecordingCompactCard";
import { RecordingEpisodePill } from "./RecordingEpisodePill";

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
        <RecordingCompactCard
          shortId={nextUp.shortId}
          slug={nextUp.slug}
          title={nextUp.title}
          thumbnail={nextUp.thumbnail}
          speaker={nextUp.speaker}
          access={nextUp.access}
          prefetch
          footer={
            <>
              <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                {t("nextUp")}
              </span>
              <LocationPill location={nextUp.location} size="xxs" className="!text-[9px]" />
            </>
          }
        />
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
            staggerIndex={index}
            footer={
              <>
                <RecordingEpisodePill
                  episode={related.episode}
                  episodeNumber={related.episodeNumber}
                  epShortLabel={t("epShort")}
                  fallbackLabel={t("special")}
                  asText
                  className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase"
                />
                <LocationPill location={related.location} size="xxs" className="!text-[9px]" />
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}
