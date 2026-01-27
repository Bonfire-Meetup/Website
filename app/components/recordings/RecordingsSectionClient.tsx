import type { Recording } from "@/lib/recordings/recordings";
import { useLocale, useTranslations } from "next-intl";

import { LOCATIONS } from "@/lib/config/constants";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

import { VideoCard } from "./VideoCard";

type HomepageRecording = Pick<
  Recording,
  "shortId" | "slug" | "title" | "speaker" | "date" | "thumbnail" | "location"
> & { likeCount?: number; boostCount?: number };

export function RecordingsSectionClient({ recordings }: { recordings: HomepageRecording[] }) {
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
}
