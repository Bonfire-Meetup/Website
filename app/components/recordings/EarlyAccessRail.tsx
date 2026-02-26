"use client";

import { EarlyAccessIcon } from "../shared/Icons";

import { Rail } from "./Rail";
import { RailCard } from "./RailCard";
import type { CatalogRecording } from "./RecordingsCatalogTypes";

export function EarlyAccessRail({
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
          key={`early-access-${recording.shortId}`}
          recording={recording}
          isFirst={index < 2}
        />
      )}
      headerIcon={<EarlyAccessIcon className="h-5 w-5 text-amber-500 dark:text-amber-300" />}
      headerAccent={
        <div className="flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-rose-500" />
      }
      containerClassName="rounded-[28px] px-4 py-3 ring-1 ring-amber-500/20 dark:ring-amber-300/20"
      gradientFrom="from-rose-500/5"
      gradientTo="to-orange-500/10"
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
