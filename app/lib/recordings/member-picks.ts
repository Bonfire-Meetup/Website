import { unstable_cache } from "next/cache";

import { getDatabaseClient, getDatabaseErrorDetails } from "../data/db";
import { logError, logWarn } from "../utils/log";
import { withRetry } from "../utils/retry";

import { type Recording, getAllRecordings } from "./recordings";

export type MemberPickRecording = Recording & {
  boostCount: number;
};

interface BoostRow {
  video_id: string;
  count: number;
}

type BoostFetchStatus = "ok" | "unavailable" | "error";

interface BoostFetchResult {
  rows: { videoId: string; count: number }[];
  status: BoostFetchStatus;
}

let lastMemberPicks: MemberPickRecording[] | null = null;

const fetchTopBoostedVideos = async (limit: number): Promise<BoostFetchResult> => {
  const sql = getDatabaseClient({ required: false });

  if (!sql) {
    logWarn("data.member_picks.db_client_unavailable", {
      reason: "database_client_null",
    });

    return { rows: [], status: "unavailable" };
  }

  try {
    const rows = (await withRetry(
      () => sql`
        SELECT video_id, COUNT(*)::int as count
        FROM video_boosts
        GROUP BY video_id
        ORDER BY count DESC
        LIMIT ${limit * 2}
      `,
      1,
    )) as BoostRow[];

    return {
      rows: rows.map((row) => ({ count: row.count, videoId: row.video_id })),
      status: "ok",
    };
  } catch (error) {
    const errorDetails = getDatabaseErrorDetails(error, "fetch_top_boosted_videos");
    logError("data.member_picks.fetch_failed", error, errorDetails);

    return { rows: [], status: "error" };
  }
};

const getMemberPicksUncached = async (limit = 6): Promise<MemberPickRecording[]> => {
  const [allRecordings, topBoosted] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchTopBoostedVideos(limit),
  ]);

  if (topBoosted.status !== "ok") {
    return lastMemberPicks ? lastMemberPicks.slice(0, limit) : [];
  }

  const boostMap = new Map(topBoosted.rows.map((b) => [b.videoId, b.count]));

  const boostedRecordings = allRecordings
    .filter((r) => boostMap.has(r.shortId))
    .map((r) => ({
      ...r,
      boostCount: boostMap.get(r.shortId) ?? 0,
    }))
    .sort((a, b) => b.boostCount - a.boostCount)
    .slice(0, limit);

  if (boostedRecordings.length >= limit) {
    lastMemberPicks = boostedRecordings;
    return boostedRecordings;
  }

  const usedIds = new Set(boostedRecordings.map((r) => r.shortId));
  const backfillCount = limit - boostedRecordings.length;

  const newestFeaturedBackfill = allRecordings
    .filter((r) => !usedIds.has(r.shortId) && r.featureHeroThumbnail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, backfillCount)
    .map((r) => ({ ...r, boostCount: 0 }));

  if (boostedRecordings.length + newestFeaturedBackfill.length >= limit) {
    const picks = [...boostedRecordings, ...newestFeaturedBackfill];

    if (boostedRecordings.length > 0) {
      lastMemberPicks = picks;
    }

    return picks;
  }

  const stillNeeded = limit - boostedRecordings.length - newestFeaturedBackfill.length;
  const allUsedIds = new Set([...usedIds, ...newestFeaturedBackfill.map((r) => r.shortId)]);

  const newestRemainingBackfill = allRecordings
    .filter((r) => !allUsedIds.has(r.shortId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, stillNeeded)
    .map((r) => ({ ...r, boostCount: 0 }));

  const picks = [...boostedRecordings, ...newestFeaturedBackfill, ...newestRemainingBackfill];

  if (boostedRecordings.length > 0) {
    lastMemberPicks = picks;
  }

  return picks;
};

export const getMemberPicks = unstable_cache(getMemberPicksUncached, ["member-picks"], {
  revalidate: 3600,
  tags: ["member-picks"],
});
