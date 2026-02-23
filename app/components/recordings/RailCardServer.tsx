import type { CatalogRecording } from "./RecordingsCatalogTypes";

import { RecordingDetailedCard } from "./RecordingDetailedCard";
import { buildRailDetailedCardProps, type RailCardBadge } from "./rail-card-utils";

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
