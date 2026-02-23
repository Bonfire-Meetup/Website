"use client";

import type { HiddenGemRecording } from "./RecordingsCatalogTypes";

import { TrendRail } from "./TrendRail";

export function HiddenGemsRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
}: {
  title: string;
  recordings: HiddenGemRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}) {
  return (
    <TrendRail
      kind="hiddenGems"
      title={title}
      recordings={recordings}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
