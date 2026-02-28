"use client";

import { GuildIcon } from "../shared/Icons";

import { Rail } from "./Rail";
import { RailCard } from "./RailCard";
import type { CatalogRecording } from "./RecordingsCatalogTypes";

export function GuildVaultRail({
  title,
  recordings,
  scrollLeftLabel,
  scrollRightLabel,
  viewAllHref,
  viewAllLabel,
}: {
  title: string;
  recordings: CatalogRecording[];
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  return (
    <Rail
      title={title}
      items={recordings}
      renderItem={(recording, index) => (
        <RailCard
          key={`guild-vault-${recording.shortId}`}
          recording={recording}
          isFirst={index < 2}
        />
      )}
      headerIcon={<GuildIcon className="h-5 w-5 text-red-500 dark:text-red-300" />}
      headerAccent={
        <div className="flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-rose-500" />
      }
      containerClassName="rounded-[28px] px-4 py-3 ring-1 ring-red-500/20 dark:ring-red-300/20"
      gradientFrom="from-red-500/5"
      gradientTo="to-rose-500/10"
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    />
  );
}
