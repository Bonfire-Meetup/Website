import type { ReactNode } from "react";

import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import type { CatalogRecording } from "@/lib/recordings/catalog-types";
import { LIBRARY_SHELVES } from "@/lib/recordings/library-filter";

import { BoltIcon, FireIcon } from "../shared/Icons";

import { getLibraryShelfTheme } from "./library-shelf-theme";
import type { RailCardBadge } from "./rail-card-utils";

export type TrendRailKind = "memberPicks" | "hot" | "hiddenGems";

export function getTrendRailChrome(kind: TrendRailKind): {
  keyPrefix: string;
  headerIcon: ReactNode;
  headerAccent: ReactNode;
  containerClassName: string;
  gradientFrom: string;
  gradientTo: string;
} {
  const shelf =
    kind === "memberPicks"
      ? LIBRARY_SHELVES.MEMBER_PICKS
      : kind === "hot"
        ? LIBRARY_SHELVES.HOT
        : LIBRARY_SHELVES.HIDDEN_GEMS;
  const theme = getLibraryShelfTheme(shelf);

  if (!theme) {
    throw new Error(`Missing theme for shelf "${shelf}"`);
  }

  const Icon = theme.icon;

  return {
    keyPrefix: theme.keyPrefix,
    headerIcon: <Icon className={theme.rail.iconClassName} />,
    headerAccent: <div className={theme.rail.accentClassName} />,
    containerClassName: theme.rail.containerClassName,
    gradientFrom: theme.rail.gradientFrom,
    gradientTo: theme.rail.gradientTo,
  };
}

type RailEngagementRecording = CatalogRecording & {
  likeCount?: number;
  boostCount?: number;
};

export function getTrendRailBadge(
  kind: TrendRailKind,
  recording: RailEngagementRecording,
): RailCardBadge | undefined {
  if (kind === "memberPicks" && (recording.boostCount ?? 0) > 0) {
    return {
      count: recording.boostCount ?? 0,
      gradient: ENGAGEMENT_BRANDING.boost.classes.activeGradient,
      icon: <BoltIcon className="h-3.5 w-3.5" />,
    };
  }

  if (kind === "hot" && (recording.likeCount ?? 0) > 0) {
    return {
      count: recording.likeCount ?? 0,
      gradient: ENGAGEMENT_BRANDING.like.classes.activeGradient,
      icon: <FireIcon className="h-3.5 w-3.5" />,
    };
  }

  return undefined;
}
