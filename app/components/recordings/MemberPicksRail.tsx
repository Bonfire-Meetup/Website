"use client";

import type { MemberPickRecording } from "@/lib/recordings/catalog-types";

import { TrendRail } from "./TrendRail";

export function MemberPicksRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  recordings: MemberPickRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <TrendRail
      kind="memberPicks"
      title={title}
      recordings={recordings}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    />
  );
}
