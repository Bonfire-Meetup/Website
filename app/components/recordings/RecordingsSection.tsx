import type { Locale } from "@/lib/i18n/locales";
import type { Recording } from "@/lib/recordings/recordings";
import type { TrendingRecording } from "@/lib/recordings/trending";
import { getTranslations } from "next-intl/server";

import { getRequestLocale } from "@/lib/i18n/request-locale";

import { SectionHeader } from "../ui/SectionHeader";

import { RecordingsSectionClient } from "./RecordingsSectionClient";

interface RecordingsSectionProps {
  recordings: (Recording | TrendingRecording)[];
  locale?: Locale;
}

export async function RecordingsSection({
  recordings,
  locale: localeProp,
}: RecordingsSectionProps) {
  const locale = localeProp ?? (await getRequestLocale());
  const t = await getTranslations({ locale, namespace: "sections.recordings" });
  const homepageRecordings = recordings.map((recording) => ({
    boostCount: "boostCount" in recording ? recording.boostCount : undefined,
    date: recording.date,
    likeCount: "likeCount" in recording ? recording.likeCount : undefined,
    location: recording.location,
    shortId: recording.shortId,
    slug: recording.slug,
    speaker: recording.speaker,
    thumbnail: recording.thumbnail,
    title: recording.title,
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

        <RecordingsSectionClient recordings={homepageRecordings} />
      </div>
    </section>
  );
}
