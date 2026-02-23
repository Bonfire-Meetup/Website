import type { RailCardBadge } from "./rail-card-utils";
import type { CatalogRecording } from "./RecordingsCatalogTypes";
import type { ReactNode } from "react";

import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";

import { BoltIcon, FireIcon, SparklesIcon } from "../shared/Icons";

export type TrendRailKind = "memberPicks" | "hot" | "hiddenGems";

export function getTrendRailChrome(kind: TrendRailKind): {
  keyPrefix: string;
  headerIcon: ReactNode;
  headerAccent: ReactNode;
  containerClassName: string;
  gradientFrom: string;
  gradientTo: string;
} {
  if (kind === "memberPicks") {
    return {
      keyPrefix: "member-pick",
      headerIcon: (
        <BoltIcon className={`h-5 w-5 text-${ENGAGEMENT_BRANDING.boost.colors.gradientFrom}`} />
      ),
      headerAccent: (
        <div
          className={`flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-${ENGAGEMENT_BRANDING.boost.colors.gradientFrom} to-${ENGAGEMENT_BRANDING.boost.colors.gradientTo}`}
        />
      ),
      containerClassName: "rounded-[28px] px-2 pt-2 pb-2",
      gradientFrom: `from-${ENGAGEMENT_BRANDING.boost.colors.railLight}`,
      gradientTo: `to-${ENGAGEMENT_BRANDING.boost.colors.railLightSecondary}`,
    };
  }

  if (kind === "hot") {
    return {
      keyPrefix: "hot",
      headerIcon: (
        <FireIcon className={`h-5 w-5 text-${ENGAGEMENT_BRANDING.like.colors.gradientTo}`} />
      ),
      headerAccent: (
        <div
          className={`flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-${ENGAGEMENT_BRANDING.like.colors.gradientFrom} to-${ENGAGEMENT_BRANDING.like.colors.gradientTo}`}
        />
      ),
      containerClassName: "rounded-[28px] px-2 pt-2 pb-2",
      gradientFrom: `from-${ENGAGEMENT_BRANDING.like.colors.railLight}`,
      gradientTo: `to-${ENGAGEMENT_BRANDING.like.colors.railLightSecondary}`,
    };
  }

  return {
    keyPrefix: "hidden-gem",
    headerIcon: <SparklesIcon className="h-5 w-5 text-purple-500" />,
    headerAccent: (
      <div className="flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
    ),
    containerClassName: "rounded-[28px] px-2 pt-2 pb-2",
    gradientFrom: "from-purple-500/5",
    gradientTo: "to-indigo-500/5",
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
