import { getTranslations } from "next-intl/server";

import { getInitialLocale } from "@/lib/i18n/initial";
import { getHiddenGems } from "@/lib/recordings/hidden-gems";
import { getHotRecordingsSafe } from "@/lib/recordings/hot-picks";
import { getMemberPicksSafe } from "@/lib/recordings/member-picks";

import { HiddenGemsRail } from "./HiddenGemsRail";
import { HotPicksRail } from "./HotPicksRail";
import { MemberPicksRail } from "./MemberPicksRail";

interface TrendingRailProps {
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}

export async function MemberPicksRailServer({
  scrollLeftLabel,
  scrollRightLabel,
}: TrendingRailProps) {
  const locale = await getInitialLocale();
  const [memberPicks, tRows] = await Promise.all([
    getMemberPicksSafe(6),
    getTranslations({ locale, namespace: "libraryPage.rows" }),
  ]);

  const recordings = memberPicks.map((recording) => ({
    boostCount: recording.boostCount,
    date: recording.date,
    description: recording.description,
    episode: recording.episode,
    episodeId: recording.episodeId,
    episodeNumber: recording.episodeNumber,
    featureHeroThumbnail: recording.featureHeroThumbnail,
    location: recording.location,
    shortId: recording.shortId,
    slug: recording.slug,
    speaker: recording.speaker,
    tags: recording.tags,
    thumbnail: recording.thumbnail,
    title: recording.title,
  }));

  return (
    <MemberPicksRail
      title={tRows("memberPicks")}
      recordings={recordings}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}

export async function HotPicksRailServer({ scrollLeftLabel, scrollRightLabel }: TrendingRailProps) {
  const locale = await getInitialLocale();
  const [hotPicks, tRows] = await Promise.all([
    getHotRecordingsSafe(6),
    getTranslations({ locale, namespace: "libraryPage.rows" }),
  ]);

  const recordings = hotPicks.map((recording) => ({
    date: recording.date,
    description: recording.description,
    episode: recording.episode,
    episodeId: recording.episodeId,
    episodeNumber: recording.episodeNumber,
    featureHeroThumbnail: recording.featureHeroThumbnail,
    likeCount: recording.likeCount,
    location: recording.location,
    shortId: recording.shortId,
    slug: recording.slug,
    speaker: recording.speaker,
    tags: recording.tags,
    thumbnail: recording.thumbnail,
    title: recording.title,
  }));

  return (
    <HotPicksRail
      title={tRows("hot")}
      recordings={recordings}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}

export async function HiddenGemsRailServer({
  scrollLeftLabel,
  scrollRightLabel,
}: TrendingRailProps) {
  const locale = await getInitialLocale();
  const [hiddenGems, tRows] = await Promise.all([
    getHiddenGems(6),
    getTranslations({ locale, namespace: "libraryPage.rows" }),
  ]);

  if (hiddenGems.length === 0) {
    return null;
  }

  const recordings = hiddenGems.map((recording) => ({
    date: recording.date,
    description: recording.description,
    episode: recording.episode,
    episodeId: recording.episodeId,
    episodeNumber: recording.episodeNumber,
    featureHeroThumbnail: recording.featureHeroThumbnail,
    location: recording.location,
    shortId: recording.shortId,
    slug: recording.slug,
    speaker: recording.speaker,
    tags: recording.tags,
    thumbnail: recording.thumbnail,
    title: recording.title,
  }));

  return (
    <HiddenGemsRail
      title={tRows("hiddenGems")}
      recordings={recordings}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    />
  );
}
