import type { CatalogRecording } from "./RecordingsCatalogTypes";

import { RailCardServer } from "./RailCardServer";
import { RailServer } from "./RailServer";
import { getRailCardKey } from "./rail-card-utils";

interface RecordingRailServerProps {
  title: string;
  recordings: CatalogRecording[];
  locale: string;
  scrollLeftLabel: string;
  scrollRightLabel: string;
}

export function RecordingRailServer({
  title,
  recordings,
  locale,
  scrollLeftLabel,
  scrollRightLabel,
}: RecordingRailServerProps) {
  return (
    <RailServer
      title={title}
      itemCount={recordings.length}
      containerClassName="rounded-[28px] bg-white/60 px-2 pt-2 pb-2 dark:bg-neutral-950/60"
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    >
      {recordings.map((recording, index) => (
        <RailCardServer
          key={getRailCardKey(title, recording.shortId)}
          recording={recording}
          locale={locale}
          isFirst={index < 2}
        />
      ))}
    </RailServer>
  );
}
