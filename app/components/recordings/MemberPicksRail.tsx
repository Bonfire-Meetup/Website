"use client";

import type { MemberPickRecording } from "./RecordingsCatalogTypes";

import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";

import { BoltIcon } from "../shared/icons";

import { Rail } from "./Rail";
import { RailCard } from "./RailCard";

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
                  count: recording.boostCount,
                  gradient: ENGAGEMENT_BRANDING.boost.classes.activeGradient,
                  icon: <BoltIcon className="h-3.5 w-3.5" />,
                }
              : undefined
          }
        />
      )}
      headerIcon={
        <BoltIcon className={`h-5 w-5 text-${ENGAGEMENT_BRANDING.boost.colors.gradientFrom}`} />
      }
      headerAccent={
        <div
          className={`flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-${ENGAGEMENT_BRANDING.boost.colors.gradientFrom} to-${ENGAGEMENT_BRANDING.boost.colors.gradientTo}`}
        />
      }
      containerClassName="rounded-[28px] px-2 pt-2 pb-2"
      gradientFrom={`from-${ENGAGEMENT_BRANDING.boost.colors.railLight}`}
      gradientTo={`to-${ENGAGEMENT_BRANDING.boost.colors.railLightSecondary}`}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
