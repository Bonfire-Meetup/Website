import { FireIcon } from "../shared/icons";
import { Rail } from "./Rail";
import { RailCard } from "./RailCard";
import type { HotRecording } from "./RecordingsCatalogTypes";

export function HotPicksRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
}: {
  title: string;
  recordings: HotRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}) {
  return (
    <Rail
      title={title}
      items={recordings}
      renderItem={(recording, index) => (
        <RailCard
          key={`hot-${recording.shortId}`}
          recording={recording}
          isFirst={index < 2}
          badge={
            recording.likeCount > 0
              ? {
                  icon: <FireIcon className="h-3.5 w-3.5" />,
                  count: recording.likeCount,
                  gradient: "bg-gradient-to-r from-rose-500 to-orange-500",
                }
              : undefined
          }
        />
      )}
      headerIcon={<FireIcon className="h-5 w-5 text-rose-500" />}
      headerAccent={
        <div className="flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
      }
      containerClassName="rounded-[28px] px-2 pt-2 pb-2"
      gradientFrom="from-rose-500/5"
      gradientTo="to-orange-500/5"
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
