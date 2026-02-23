"use client";

import type { MemberPickRecording } from "./RecordingsCatalogTypes";

import { TrendRail } from "./TrendRail";

export function MemberPicksRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
}: {
  title: string;
  recordings: MemberPickRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}) {
  return (
    <TrendRail
      kind="memberPicks"
      title={title}
      recordings={recordings}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
