import { useTranslations } from "next-intl";

import { CalendarIcon, MapPinIcon, UserIcon } from "@/components/shared/Icons";
import { AccentBar } from "@/components/ui/AccentBar";
import { Pill } from "@/components/ui/Pill";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { MEMBERSHIP_TIER_LABELS } from "@/lib/config/membership";
import { getRecordingAccessState } from "@/lib/recordings/early-access";
import type { Recording } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { RecordingEpisodePill } from "./RecordingEpisodePill";
import { RecordingHeaderMetaRow } from "./RecordingHeaderMetaRow";
import { RecordingTagPill } from "./RecordingTagPill";

interface VideoMetadataProps {
  recording: Recording;
  formattedDate: string;
  hideEarlyAccessBadge?: boolean;
}

export function VideoMetadata({
  recording,
  formattedDate,
  hideEarlyAccessBadge = false,
}: VideoMetadataProps) {
  const t = useTranslations("recordings");
  const { isEarlyAccess, isRestricted, requiredMembershipTier } = getRecordingAccessState(
    recording.access,
  );
  const requiredGuildLevelName = requiredMembershipTier
    ? MEMBERSHIP_TIER_LABELS[requiredMembershipTier]
    : "";
  const requiredAccessLabel =
    requiredMembershipTier === 0
      ? isEarlyAccess
        ? ""
        : t("membersOnlyRequiredLogin")
      : requiredGuildLevelName
        ? t("earlyAccessRequiredGuildByName", { level: requiredGuildLevelName })
        : "";
  const accessLabelPrefix = isEarlyAccess ? t("earlyAccess") : t("membersOnly");
  const accessLabel = requiredAccessLabel
    ? `${accessLabelPrefix} · ${requiredAccessLabel}`
    : accessLabelPrefix;

  return (
    <div className="px-5 py-5 sm:px-6 sm:py-6">
      <div className="mb-4 flex gap-3">
        <div className="flex h-7 items-center sm:h-8 lg:h-9">
          <AccentBar />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl lg:text-[1.75rem] dark:text-white">
          {recording.title}
        </h1>
      </div>

      <RecordingHeaderMetaRow
        location={recording.location}
        formattedDate={formattedDate}
        className="mb-5 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-600 dark:text-neutral-300"
        leftGroupClassName="flex flex-wrap items-center gap-2"
        metaGroupClassName="flex flex-wrap items-center gap-2"
        leftContent={
          <>
            {isRestricted && !hideEarlyAccessBadge && (
              <Pill
                size="sm"
                className={`${ENGAGEMENT_BRANDING.access.classes.metadataPill} font-semibold tracking-[0.15em] uppercase`}
              >
                {accessLabel}
              </Pill>
            )}
            {recording.speaker.map((name) => (
              <Pill
                key={name}
                href={`${PAGE_ROUTES.LIBRARY_BROWSE}?q=${encodeURIComponent(name)}`}
                size="sm"
                className="gap-2 bg-white font-semibold text-neutral-700 shadow-sm ring-1 ring-black/5 transition hover:bg-white/80 dark:bg-white/10 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-white/20"
              >
                <UserIcon className="text-brand-500 dark:text-brand-400 h-3.5 w-3.5" />
                {name}
              </Pill>
            ))}
          </>
        }
        dateNode={
          <Pill
            size="sm"
            className="gap-2 bg-white font-semibold text-neutral-600 shadow-sm ring-1 ring-black/5 dark:bg-white/10 dark:text-neutral-300 dark:ring-white/10"
          >
            <CalendarIcon className="text-brand-500 dark:text-brand-400 h-3.5 w-3.5" />
            {formattedDate}
          </Pill>
        }
        locationHref={`${PAGE_ROUTES.LIBRARY_BROWSE}?location=${recording.location}`}
        locationSize="sm"
        locationVariant="neutral"
        locationIcon={<MapPinIcon className="text-brand-500 dark:text-brand-400 h-3.5 w-3.5" />}
        locationClassName="gap-2 bg-white font-semibold shadow-sm ring-1 ring-black/5 transition hover:bg-white/80 dark:bg-white/10 dark:ring-white/10 dark:hover:bg-white/20"
        rightContent={
          recording.episodeId ? (
            <RecordingEpisodePill
              href={`${PAGE_ROUTES.LIBRARY_BROWSE}?episode=${encodeURIComponent(recording.episodeId)}`}
              size="sm"
              className="bg-neutral-900/5 font-semibold tracking-[0.15em] text-neutral-600 uppercase transition hover:bg-neutral-900/10 hover:text-neutral-800 dark:bg-white/10 dark:text-neutral-200 dark:hover:bg-white/20 dark:hover:text-white"
              episodeId={recording.episodeId}
              episode={recording.episode}
              episodeNumber={recording.episodeNumber}
              epShortLabel={t("epShort")}
              showTitle
            />
          ) : null
        }
      />

      <div className="border-t border-neutral-200/40 pt-5 dark:border-neutral-700/40">
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
          {recording.description}
        </p>

        {recording.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {recording.tags.map((tag) => (
              <RecordingTagPill
                key={tag}
                tag={tag}
                href={`${PAGE_ROUTES.LIBRARY_BROWSE}?tag=${encodeURIComponent(tag)}`}
                size="xxs"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
