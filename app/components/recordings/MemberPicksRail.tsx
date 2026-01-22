import { BoltIcon } from "../shared/icons";
import { Rail } from "./Rail";
import { RailCard } from "./RailCard";
import type { MemberPickRecording } from "./RecordingsCatalogTypes";

export function MemberPicksRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
}: {
  title: string;
  recordings: MemberPickRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}) {
  return (
    <Rail
      title={title}
      items={recordings}
      renderItem={(recording, index) => (
        <RailCard
          key={`member-pick-${recording.shortId}`}
          recording={recording}
          isFirst={index < 2}
          badge={
            recording.boostCount > 0
              ? {
                  icon: <BoltIcon className="h-3.5 w-3.5" />,
                  count: recording.boostCount,
                  gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
                }
              : undefined
          }
        />
      )}
      headerIcon={<BoltIcon className="h-5 w-5 text-emerald-500" />}
      headerAccent={
        <div className="flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
      }
      containerClassName="rounded-[28px] px-2 pt-2 pb-2"
      gradientFrom="from-emerald-500/5"
      gradientTo="to-teal-500/5"
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
