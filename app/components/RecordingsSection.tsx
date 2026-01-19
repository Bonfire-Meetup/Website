import { getLocale, getTranslations } from "next-intl/server";
import type { Recording } from "../lib/recordings";
import { getProxiedThumbnailUrl } from "../lib/thumbnail";
import { RecordingsSectionClient } from "./RecordingsSectionClient";

interface RecordingsSectionProps {
  recordings: Recording[];
}

export async function RecordingsSection({ recordings }: RecordingsSectionProps) {
  const t = await getTranslations("sections.recordings");
  const tRec = await getTranslations("recordings");
  const locale = await getLocale();
  const homepageRecordings = recordings.map((recording) => ({
    shortId: recording.shortId,
    slug: recording.slug,
    title: recording.title,
    speaker: recording.speaker,
    date: recording.date,
    thumbnail: getProxiedThumbnailUrl(recording.thumbnail),
    location: recording.location,
  }));

  return (
    <section className="relative px-4 py-28 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div id="recordings" className="mb-12 scroll-mt-24 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            {t("title")}
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-neutral-600 dark:text-neutral-400">
            {t("subtitle")}
          </p>
        </div>

        <RecordingsSectionClient
          recordings={homepageRecordings}
          labels={{
            all: t("filter.all"),
            prague: t("filter.prague"),
            zlin: t("filter.zlin"),
            empty: t("empty"),
            viewAll: t("viewAll"),
            ariaLocationLabel: tRec("locationLabel", { location: "{location}" }),
          }}
          locale={locale}
        />
      </div>
    </section>
  );
}
