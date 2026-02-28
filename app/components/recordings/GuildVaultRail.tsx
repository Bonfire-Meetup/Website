"use client";

import { LIBRARY_SHELVES } from "@/lib/recordings/library-filter";

import { getLibraryShelfTheme } from "./library-shelf-theme";
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
  const theme = getLibraryShelfTheme(LIBRARY_SHELVES.GUILD_VAULT);

  if (!theme) {
    return null;
  }

  const Icon = theme.icon;

  return (
    <Rail
      title={title}
      items={recordings}
      renderItem={(recording, index) => (
        <RailCard
          key={`${theme.keyPrefix}-${recording.shortId}`}
          recording={recording}
          isFirst={index < 2}
        />
      )}
      headerIcon={<Icon className={theme.rail.iconClassName} />}
      headerAccent={<div className={theme.rail.accentClassName} />}
      containerClassName={theme.rail.containerClassName}
      gradientFrom={theme.rail.gradientFrom}
      gradientTo={theme.rail.gradientTo}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
    />
  );
}
