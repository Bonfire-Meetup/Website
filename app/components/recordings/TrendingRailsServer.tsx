import { getTranslations } from "next-intl/server";

import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getHiddenGems } from "@/lib/recordings/hidden-gems";
import { getHotRecordingsSafe } from "@/lib/recordings/hot-picks";
import { getMemberPicksSafe } from "@/lib/recordings/member-picks";

import { getRailCardKey } from "./rail-card-utils";
import { RailCardServer } from "./RailCardServer";
import { RailServer } from "./RailServer";
import type { CatalogRecording } from "./RecordingsCatalogTypes";
import { getTrendRailBadge, getTrendRailChrome, type TrendRailKind } from "./trend-rail-config";

interface TrendingRailProps {
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}

function renderTrendingRailServer<T extends CatalogRecording>({
  kind,
  title,
  recordings,
  locale,
  scrollLeftLabel,
  scrollRightLabel,
}: {
  kind: TrendRailKind;
  title: string;
  recordings: T[];
  locale: string;
  scrollLeftLabel: string;
  scrollRightLabel: string;
}) {
  if (recordings.length === 0) {
    return null;
  }

  const chrome = getTrendRailChrome(kind);

  return (
    <RailServer
      title={title}
      itemCount={recordings.length}
      headerIcon={chrome.headerIcon}
      headerAccent={chrome.headerAccent}
      containerClassName={chrome.containerClassName}
      gradientFrom={chrome.gradientFrom}
      gradientTo={chrome.gradientTo}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    >
      {recordings.map((recording, index) => (
        <RailCardServer
          key={getRailCardKey(chrome.keyPrefix, recording.shortId)}
          recording={recording}
          locale={locale}
          isFirst={index < 2}
          badge={getTrendRailBadge(kind, recording)}
        />
      ))}
    </RailServer>
  );
}

export async function MemberPicksRailServer({
  scrollLeftLabel = "Scroll left",
  scrollRightLabel = "Scroll right",
}: TrendingRailProps) {
  const locale = await getRequestLocale();
  const [memberPicks, tRows] = await Promise.all([
    getMemberPicksSafe(6),
    getTranslations({ locale, namespace: "libraryPage.rows" }),
  ]);

  return renderTrendingRailServer({
    kind: "memberPicks",
    title: tRows("memberPicks"),
    recordings: memberPicks,
    locale,
    scrollLeftLabel,
    scrollRightLabel,
  });
}

export async function HotPicksRailServer({
  scrollLeftLabel = "Scroll left",
  scrollRightLabel = "Scroll right",
}: TrendingRailProps) {
  const locale = await getRequestLocale();
  const [hotPicks, tRows] = await Promise.all([
    getHotRecordingsSafe(6),
    getTranslations({ locale, namespace: "libraryPage.rows" }),
  ]);

  return renderTrendingRailServer({
    kind: "hot",
    title: tRows("hot"),
    recordings: hotPicks,
    locale,
    scrollLeftLabel,
    scrollRightLabel,
  });
}

export async function HiddenGemsRailServer({
  scrollLeftLabel = "Scroll left",
  scrollRightLabel = "Scroll right",
}: TrendingRailProps) {
  const locale = await getRequestLocale();
  const [hiddenGems, tRows] = await Promise.all([
    getHiddenGems(6),
    getTranslations({ locale, namespace: "libraryPage.rows" }),
  ]);

  return renderTrendingRailServer({
    kind: "hiddenGems",
    title: tRows("hiddenGems"),
    recordings: hiddenGems,
    locale,
    scrollLeftLabel,
    scrollRightLabel,
  });
}
