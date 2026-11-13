import { useTranslations } from "next-intl";
import Link from "next/link";

import { LOCATIONS } from "@/lib/config/constants";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { FireIcon, PlayIcon } from "../shared/Icons";

import { RecordingAccessPill } from "./RecordingAccessPill";
import { RecordingEpisodePill } from "./RecordingEpisodePill";
import { RecordingImage } from "./RecordingImage";
import type { RelatedRecording } from "./RecordingPlayer";

interface RelatedVideosSectionProps {
  relatedRecordings: RelatedRecording[];
}

function RelatedTalkRow({ related, isNextUp }: { related: RelatedRecording; isNextUp: boolean }) {
  const t = useTranslations("recordings");
  const tCommon = useTranslations("common");
  const isPrague = related.location === LOCATIONS.PRAGUE;

  return (
    <li>
      <Link
        href={PAGE_ROUTES.WATCH(related.slug, related.shortId)}
        prefetch={false}
        className={`group flex items-center gap-4 rounded-2xl p-3 transition-colors ${
          isNextUp
            ? "bg-white/85 shadow-[inset_0_0_0_1px_rgba(249,115,22,0.3),0_12px_24px_-18px_rgba(249,115,22,0.55)] hover:bg-white dark:bg-white/8 dark:shadow-[inset_0_0_0_1px_rgba(251,146,60,0.28)] dark:hover:bg-white/12"
            : "hover:bg-black/[0.045] dark:hover:bg-white/[0.07]"
        }`}
      >
        <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-900 shadow-[0_10px_18px_-12px_rgba(17,24,39,0.7)] ring-1 ring-black/10 dark:ring-white/12">
          <RecordingImage
            src={related.thumbnail}
            alt=""
            className="h-full"
            aspectClassName=""
            imgClassName="origin-[100%_30%] scale-[1.75] object-[100%_30%] group-hover:scale-[1.9]"
            sizes="288px"
            loading="lazy"
            fetchPriority="low"
          />
        </div>

        <div className="min-w-0 flex-1">
          {isNextUp && (
            <p className="text-2xs tracking-label-sm mb-1.5 flex items-center gap-1 font-semibold text-orange-600 uppercase dark:text-orange-300">
              <PlayIcon className="h-3 w-3" />
              {t("nextUp")}
            </p>
          )}
          <p className="line-clamp-2 text-[0.9375rem] leading-[1.3] font-semibold text-neutral-900 transition-colors group-hover:text-orange-600 dark:text-white dark:group-hover:text-orange-300">
            {related.title}
          </p>
          <p className="mt-1.5 truncate text-[0.8125rem] text-neutral-600 dark:text-neutral-300">
            {related.speaker.join(", ")}
          </p>
          <div className="text-2xs mt-2 flex items-center gap-2 font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${isPrague ? "bg-prague" : "bg-zlin"}`} />
              {isPrague ? tCommon("prague") : tCommon("zlin")}
            </span>
            <span aria-hidden="true" className="text-neutral-300 dark:text-white/20">
              /
            </span>
            <RecordingEpisodePill
              episode={related.episode}
              episodeNumber={related.episodeNumber}
              epShortLabel={t("epShort")}
              fallbackLabel={t("special")}
              asText
              className="truncate"
            />
            <RecordingAccessPill access={related.access} className="text-2xs ml-auto px-2 py-0.5" />
          </div>
        </div>
      </Link>
    </li>
  );
}

export function RelatedVideosSection({ relatedRecordings }: RelatedVideosSectionProps) {
  const t = useTranslations("recordings");

  return (
    <section className="lg:sticky lg:top-20 lg:self-start">
      <div className="surface shadow-floating dark:shadow-floating relative overflow-hidden p-2.5">
        <div className="pointer-events-none absolute -top-16 right-0 h-32 w-32 rounded-full bg-orange-500/18 blur-3xl dark:bg-orange-500/14" />

        <h2 className="text-2xs tracking-label relative mb-2 flex items-center gap-1.5 px-3 pt-2.5 font-semibold text-neutral-600 uppercase dark:text-white/65">
          <FireIcon className="h-3.5 w-3.5 text-orange-500" />
          {t("relatedTitle")}
        </h2>

        <ul className="relative grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
          {relatedRecordings.map((related, index) => (
            <RelatedTalkRow key={related.shortId} related={related} isNextUp={index === 0} />
          ))}
        </ul>
      </div>
    </section>
  );
}
