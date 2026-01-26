import type { RelatedRecording } from "./RecordingPlayer";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { LocationPill } from "../locations/LocationPill";
import { PlayIcon } from "../shared/icons";

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
          prefetch
          className="group flex items-center gap-4 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/80 p-3 shadow-lg shadow-black/5 transition hover:-translate-y-0.5 hover:border-neutral-200 hover:shadow-xl dark:border-white/10 dark:bg-neutral-950 dark:shadow-black/20 dark:hover:border-white/20"
        >
          <div className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-900">
            <Image
              src={nextUp.thumbnail}
              alt={nextUp.title}
              fill
              sizes="112px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-semibold tracking-[0.2em] text-neutral-700 uppercase shadow-sm">
              <PlayIcon className="h-3 w-3" />
              {t("nextUp")}
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
              {t("nextUp")}
            </p>
            <p className="group-hover:text-brand-500 dark:group-hover:text-brand-400 mt-1 line-clamp-2 text-sm font-semibold text-neutral-900 dark:text-white">
              {nextUp.title}
            </p>
          </div>
        </Link>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
        {remainingRelated.map((related, index) => (
          <Link
            key={related.shortId}
            href={PAGE_ROUTES.WATCH(related.slug, related.shortId)}
            prefetch={false}
            className={`group recording-card-enter opacity-0 stagger-${
              (index % 8) + 1
            } relative flex flex-col overflow-hidden rounded-[24px] bg-white/90 text-neutral-900 shadow-xl ring-1 shadow-black/5 ring-black/5 transition-all hover:-translate-y-1 dark:bg-neutral-950 dark:text-white dark:shadow-black/10 dark:ring-white/10`}
          >
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={related.thumbnail}
                alt={related.title}
                fill
                sizes="(max-width: 1024px) 50vw, 360px"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="flex flex-1 flex-col justify-start">
                <h3 className="group-hover:text-brand-500 dark:group-hover:text-brand-400 line-clamp-2 text-sm leading-snug font-semibold text-neutral-900 transition-colors dark:text-white">
                  {related.title}
                </h3>
                <div className="mt-2 flex flex-col gap-1">
                  {related.speaker.map((name: string) => (
                    <div key={name} className="flex items-center gap-2">
                      <span className="bg-brand-500 dark:bg-brand-400 h-1 w-1 shrink-0 rounded-full shadow-[0_0_4px_var(--color-brand-glow-light)]" />
                      <span className="truncate text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-white/5">
                <span className="text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                  {related.episode
                    ? related.episodeNumber
                      ? `${t("epShort")} ${related.episodeNumber}`
                      : related.episode
                    : t("special")}
                </span>
                <LocationPill location={related.location} size="xxs" className="!text-[9px]" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
