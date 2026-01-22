import type { Recording } from "@/lib/recordings/recordings";
import type { TrendingRecording } from "@/lib/recordings/trending";
import { getTranslations } from "next-intl/server";

import { SectionHeader } from "../ui/SectionHeader";

import { RecordingsSectionClient } from "./RecordingsSectionClient";

interface RecordingsSectionProps {
  recordings: (Recording | TrendingRecording)[];
}

export async function RecordingsSection({ recordings }: RecordingsSectionProps) {
  const t = await getTranslations("sections.recordings");
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
