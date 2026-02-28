"use client";

import type { CatalogRecording } from "@/lib/recordings/catalog-types";

import { Rail } from "./Rail";
import { getRailCardKey } from "./rail-card-utils";
import { RailCard } from "./RailCard";
import { getTrendRailBadge, getTrendRailChrome, type TrendRailKind } from "./trend-rail-config";

export function TrendRail<T extends CatalogRecording>({
  kind,
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
  viewAllHref,
  viewAllLabel,
}: {
  kind: TrendRailKind;
  title: string;
  recordings: T[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  const chrome = getTrendRailChrome(kind);

  return (
    <Rail
      title={title}
      items={recordings}
      renderItem={(recording, index) => (
        <RailCard
          key={getRailCardKey(chrome.keyPrefix, recording.shortId)}
          recording={recording}
          isFirst={index < 2}
          badge={getTrendRailBadge(kind, recording)}
        />
      )}
      headerIcon={chrome.headerIcon}
      headerAccent={chrome.headerAccent}
      containerClassName={chrome.containerClassName}
      gradientFrom={chrome.gradientFrom}
      gradientTo={chrome.gradientTo}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    />
  );
}
