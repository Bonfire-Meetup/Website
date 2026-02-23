import type { CatalogRecording } from "./RecordingsCatalogTypes";

import { RecordingDetailedCard } from "./RecordingDetailedCard";
import { buildRailDetailedCardProps, type RailCardBadge } from "./rail-card-utils";

interface RailCardProps {
  recording: CatalogRecording;
  isFirst?: boolean;
  badge?: RailCardBadge;
}

export function RailCard({ recording, isFirst = false, badge }: RailCardProps) {
  return <RecordingDetailedCard {...buildRailDetailedCardProps({ recording, isFirst, badge })} />;
}
