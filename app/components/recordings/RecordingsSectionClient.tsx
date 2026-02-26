import { useLocale, useTranslations } from "next-intl";

import type { Recording } from "@/lib/recordings/recordings";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { formatDate } from "@/lib/utils/locale";

import { LocationPill } from "../locations/LocationPill";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";

import { RecordingCompactCard } from "./RecordingCompactCard";

type HomepageRecording = Pick<
  Recording,
  "shortId" | "slug" | "title" | "speaker" | "date" | "thumbnail" | "location" | "access"
>;

export function RecordingsSectionClient({ recordings }: { recordings: HomepageRecording[] }) {
  const t = useTranslations("sections.recordings");
  const tRecordings = useTranslations("recordings");
  const locale = useLocale();

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {recordings.map((recording) => (
          <RecordingCompactCard
            key={recording.shortId}
            shortId={recording.shortId}
            slug={recording.slug}
            title={recording.title}
            speaker={recording.speaker}
            thumbnail={recording.thumbnail}
            access={recording.access}
            imageSizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            footer={
              <>
                <span className="text-[10px] font-medium tracking-wider text-white/70 uppercase">
                  {formatDate(recording.date, locale)}
                </span>
                <LocationPill
                  location={recording.location}
                  size="xxs"
                  className="!text-[9px] !text-white/80"
                  ariaLabel={tRecordings("locationLabel", { location: recording.location })}
                />
              </>
            }
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
