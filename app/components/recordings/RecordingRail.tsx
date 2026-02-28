import type { CatalogRecording } from "@/lib/recordings/catalog-types";

import { Rail } from "./Rail";
import { getRailCardKey } from "./rail-card-utils";
import { RailCard } from "./RailCard";

export function RecordingRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
}: {
  title: string;
  recordings: CatalogRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}) {
  return (
    <Rail
      title={title}
      items={recordings}
      renderItem={(recording, index) => (
        <RailCard
          key={getRailCardKey(title, recording.shortId)}
          recording={recording}
          isFirst={index < 2}
        />
      )}
      containerClassName="rounded-[28px] bg-white/60 px-4 py-3 dark:bg-neutral-950/60"
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
