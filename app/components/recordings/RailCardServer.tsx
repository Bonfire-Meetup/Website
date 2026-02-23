import type { CatalogRecording } from "./RecordingsCatalogTypes";

import { buildRailDetailedCardProps, type RailCardBadge } from "./rail-card-utils";
import { RecordingDetailedCard } from "./RecordingDetailedCard";

interface RailCardServerProps {
  recording: CatalogRecording;
  locale: string;
  isFirst?: boolean;
  badge?: RailCardBadge;
}

export function RailCardServer({ recording, locale, isFirst = false, badge }: RailCardServerProps) {
  return (
    <RecordingDetailedCard {...buildRailDetailedCardProps({ recording, isFirst, badge, locale })} />
  );
}
