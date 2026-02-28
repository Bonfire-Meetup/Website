"use client";

import type { HotRecording } from "@/lib/recordings/catalog-types";

import { TrendRail } from "./TrendRail";

export function HotPicksRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  recordings: HotRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <TrendRail
      kind="hot"
      title={title}
      recordings={recordings}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    />
  );
}
