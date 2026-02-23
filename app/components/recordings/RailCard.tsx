import type { CatalogRecording } from "./RecordingsCatalogTypes";

import { buildRailDetailedCardProps, type RailCardBadge } from "./rail-card-utils";
import { RecordingDetailedCard } from "./RecordingDetailedCard";

interface RailCardProps {
  recording: CatalogRecording;
  isFirst?: boolean;
  badge?: RailCardBadge;
}

export function RailCard({ recording, isFirst = false, badge }: RailCardProps) {
  return <RecordingDetailedCard {...buildRailDetailedCardProps({ recording, isFirst, badge })} />;
}
