import type { ReactNode } from "react";

import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";

import { BoltIcon, FireIcon } from "../shared/Icons";

import type { CatalogRecording } from "./RecordingsCatalogTypes";
import type { RailCardBadge } from "./rail-card-utils";

export type TrendRailKind = "memberPicks" | "hot" | "hiddenGems";

export function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.6}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  );
}

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
    headerIcon: <SparkleIcon className="h-5 w-5 text-purple-500" />,
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
