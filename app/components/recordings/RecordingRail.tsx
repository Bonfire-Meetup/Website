import { Rail } from "./Rail";
import { RailCard } from "./RailCard";
import type { CatalogRecording } from "./RecordingsCatalogTypes";

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
        <RailCard key={`${recording.shortId}-${title}`} recording={recording} isFirst={index < 2} />
      )}
      containerClassName="rounded-[28px] bg-white/60 px-2 pt-2 pb-2 dark:bg-neutral-950/60"
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
