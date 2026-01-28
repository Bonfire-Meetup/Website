import type { CatalogRecording } from "./RecordingsCatalogTypes";

import { RailCardServer } from "./RailCardServer";
import { RailServer } from "./RailServer";

interface RecordingRailServerProps {
  title: string;
  recordings: CatalogRecording[];
  locale: string;
  epShortLabel: string;
  scrollLeftLabel: string;
  scrollRightLabel: string;
}

export function RecordingRailServer({
  title,
  recordings,
  locale,
  epShortLabel,
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
          key={`${recording.shortId}-${title}`}
          recording={recording}
          locale={locale}
          epShortLabel={epShortLabel}
          isFirst={index < 2}
        />
      ))}
    </RailServer>
  );
}
