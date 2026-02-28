"use client";

import type { HiddenGemRecording } from "@/lib/recordings/catalog-types";

import { TrendRail } from "./TrendRail";

export function HiddenGemsRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  recordings: HiddenGemRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <TrendRail
      kind="hiddenGems"
      title={title}
      recordings={recordings}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    />
  );
}
