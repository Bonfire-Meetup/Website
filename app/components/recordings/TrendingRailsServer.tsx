import { getTranslations } from "next-intl/server";

import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getHiddenGems } from "@/lib/recordings/hidden-gems";
import { getHotRecordingsSafe } from "@/lib/recordings/hot-picks";
import { getMemberPicksSafe } from "@/lib/recordings/member-picks";

import { BoltIcon, FireIcon } from "../shared/icons";

import { RailCardServer } from "./RailCardServer";
import { RailServer } from "./RailServer";

function SparkleIcon({ className }: { className?: string }) {
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

interface TrendingRailProps {
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}

export async function MemberPicksRailServer({
  scrollLeftLabel = "Scroll left",
  scrollRightLabel = "Scroll right",
}: TrendingRailProps) {
  const locale = await getRequestLocale();
  const [memberPicks, tRows, tRecordings] = await Promise.all([
    getMemberPicksSafe(6),
    getTranslations({ locale, namespace: "libraryPage.rows" }),
    getTranslations({ locale, namespace: "recordings" }),
  ]);

  if (memberPicks.length === 0) {
    return null;
  }

  const epShortLabel = tRecordings("epShort");

  return (
    <RailServer
      title={tRows("memberPicks")}
      itemCount={memberPicks.length}
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
    >
      {memberPicks.map((recording, index) => (
        <RailCardServer
          key={`member-pick-${recording.shortId}`}
          recording={recording}
          locale={locale}
          epShortLabel={epShortLabel}
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
      ))}
    </RailServer>
  );
}

export async function HotPicksRailServer({
  scrollLeftLabel = "Scroll left",
  scrollRightLabel = "Scroll right",
}: TrendingRailProps) {
  const locale = await getRequestLocale();
  const [hotPicks, tRows, tRecordings] = await Promise.all([
    getHotRecordingsSafe(6),
    getTranslations({ locale, namespace: "libraryPage.rows" }),
    getTranslations({ locale, namespace: "recordings" }),
  ]);

  if (hotPicks.length === 0) {
    return null;
  }

  const epShortLabel = tRecordings("epShort");

  return (
    <RailServer
      title={tRows("hot")}
      itemCount={hotPicks.length}
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
    >
      {hotPicks.map((recording, index) => (
        <RailCardServer
          key={`hot-${recording.shortId}`}
          recording={recording}
          locale={locale}
          epShortLabel={epShortLabel}
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
      ))}
    </RailServer>
  );
}

export async function HiddenGemsRailServer({
  scrollLeftLabel = "Scroll left",
  scrollRightLabel = "Scroll right",
}: TrendingRailProps) {
  const locale = await getRequestLocale();
  const [hiddenGems, tRows, tRecordings] = await Promise.all([
    getHiddenGems(6),
    getTranslations({ locale, namespace: "libraryPage.rows" }),
    getTranslations({ locale, namespace: "recordings" }),
  ]);

  if (hiddenGems.length === 0) {
    return null;
  }

  const epShortLabel = tRecordings("epShort");

  return (
    <RailServer
      title={tRows("hiddenGems")}
      itemCount={hiddenGems.length}
      headerIcon={<SparkleIcon className="h-5 w-5 text-purple-500" />}
      headerAccent={
        <div className="flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
      }
      containerClassName="rounded-[28px] px-2 pt-2 pb-2"
      gradientFrom="from-purple-500/5"
      gradientTo="to-indigo-500/5"
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    >
      {hiddenGems.map((recording, index) => (
        <RailCardServer
          key={`hidden-gem-${recording.shortId}`}
          recording={recording}
          locale={locale}
          epShortLabel={epShortLabel}
          isFirst={index < 2}
        />
      ))}
    </RailServer>
  );
}
