"use client";

import type { HotRecording } from "./RecordingsCatalogTypes";

import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";

import { FireIcon } from "../shared/Icons";

import { Rail } from "./Rail";
import { RailCard } from "./RailCard";

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
                  count: recording.likeCount,
                  gradient: ENGAGEMENT_BRANDING.like.classes.activeGradient,
                  icon: <FireIcon className="h-3.5 w-3.5" />,
                }
              : undefined
          }
        />
      )}
      headerIcon={
        <FireIcon className={`h-5 w-5 text-${ENGAGEMENT_BRANDING.like.colors.gradientTo}`} />
      }
      headerAccent={
        <div
          className={`flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-${ENGAGEMENT_BRANDING.like.colors.gradientFrom} to-${ENGAGEMENT_BRANDING.like.colors.gradientTo}`}
        />
      }
      containerClassName="rounded-[28px] px-2 pt-2 pb-2"
      gradientFrom={`from-${ENGAGEMENT_BRANDING.like.colors.railLight}`}
      gradientTo={`to-${ENGAGEMENT_BRANDING.like.colors.railLightSecondary}`}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
