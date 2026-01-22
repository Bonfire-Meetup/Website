import { getLocale, getTranslations } from "next-intl/server";
import type { Recording } from "../../lib/recordings/recordings";
import type { TrendingRecording } from "../../lib/recordings/trending";
import { SectionHeader } from "../ui/SectionHeader";
import { RecordingsSectionClient } from "./RecordingsSectionClient";

type RecordingsSectionProps = {
  recordings: (Recording | TrendingRecording)[];
};

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
    thumbnail: recording.thumbnail,
    location: recording.location,
    likeCount: "likeCount" in recording ? recording.likeCount : undefined,
    boostCount: "boostCount" in recording ? recording.boostCount : undefined,
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
