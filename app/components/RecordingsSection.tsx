import { getLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import type { Recording } from "../lib/recordings";
import { SectionHeader } from "./SectionHeader";
import { getProxiedThumbnailUrl } from "../lib/thumbnail";

const RecordingsSectionClient = dynamic(() =>
  import("./RecordingsSectionClient").then((mod) => mod.RecordingsSectionClient),
);

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
        <SectionHeader
          id="recordings"
          title={t("title")}
          subtitle={t("subtitle")}
          className="mb-12"
        />

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
