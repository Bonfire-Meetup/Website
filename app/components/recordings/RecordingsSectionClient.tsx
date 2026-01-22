import { memo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { VideoCard } from "./VideoCard";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";
import type { Recording } from "@/lib/recordings/recordings";
import { LOCATIONS } from "@/lib/config/constants";
import { PAGE_ROUTES } from "@/lib/routes/pages";

type HomepageRecording = Pick<
  Recording,
  "shortId" | "slug" | "title" | "speaker" | "date" | "thumbnail" | "location"
> & { likeCount?: number; boostCount?: number };

export const RecordingsSectionClient = memo(function RecordingsSectionClient({
  recordings,
}: {
  recordings: HomepageRecording[];
}) {
  const t = useTranslations("sections.recordings");
  const tRecordings = useTranslations("recordings");
  const tCommon = useTranslations("common");
  const locale = useLocale();
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
            locationLabel={
              recording.location === LOCATIONS.PRAGUE ? tCommon("prague") : tCommon("zlin")
            }
            ariaLocationLabel={tRecordings("locationLabel", { location: recording.location })}
            locale={locale}
            likeCount={recording.likeCount}
            boostCount={recording.boostCount}
          />
        ))}
      </div>

      {recordings.length === 0 && (
        <EmptyState
          message={t("empty")}
          className="max-w-md p-12"
          messageClassName="text-neutral-600 dark:text-neutral-400"
        />
      )}

      <div className="mt-16 text-center">
        <Button
          href={PAGE_ROUTES.LIBRARY}
          variant="glass"
          className="inline-flex items-center gap-3"
        >
          {t("viewAll")}
        </Button>
      </div>
    </>
  );
});
