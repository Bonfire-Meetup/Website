import "server-only";

import { count, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";
import { db, getDatabaseErrorDetails } from "@/lib/data/db";
import { videoBoosts } from "@/lib/data/schema";
import { logError, logWarn } from "@/lib/utils/log";
import { withRetry } from "@/lib/utils/retry";
import { shouldDisableDbDuringBuild } from "@/lib/utils/runtime";

import { compareByBoostCountDesc } from "./engagement-scoring";
import { type Recording, getAllRecordings } from "./recordings";
import { createFeaturedBackfill, createRecentBackfill } from "./selection-utils";

export type MemberPickRecording = Recording & {
  boostCount: number;
};

interface BoostRow {
  videoId: string;
  count: number;
}

type BoostFetchStatus = "ok" | "unavailable" | "error";

interface BoostFetchResult {
  rows: { videoId: string; count: number }[];
  status: BoostFetchStatus;
}

let lastMemberPicks: MemberPickRecording[] | null = null;

const fetchTopBoostedVideos = async (limit: number): Promise<BoostFetchResult> => {
  if (shouldDisableDbDuringBuild()) {
    return { rows: [], status: "unavailable" };
  }

  const client = db({ required: false });

  if (!client) {
    logWarn("data.member_picks.db_client_unavailable", {
      reason: "database_client_null",
    });

    return { rows: [], status: "unavailable" };
  }

  try {
    const rows = (await withRetry(
      () =>
        client
          .select({
            videoId: videoBoosts.videoId,
            count: count(),
          })
          .from(videoBoosts)
          .groupBy(videoBoosts.videoId)
          .orderBy(sql`count(*) DESC`)
          .limit(limit * 2),
      3,
    )) as BoostRow[];

    return {
      rows: rows.map((row) => ({ count: row.count, videoId: row.videoId })),
      status: "ok",
    };
  } catch (error) {
    const errorDetails = getDatabaseErrorDetails(error, "fetch_top_boosted_videos");
    logError("data.member_picks.fetch_failed", error, errorDetails);

    return { rows: [], status: "error" };
  }
};

export async function getMemberPicks(limit = 6): Promise<MemberPickRecording[]> {
  "use cache";
  cacheTag("member-picks");
  cacheLife({ revalidate: CACHE_LIFETIMES.MEMBER_PICKS });

  const [allRecordings, topBoosted] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchTopBoostedVideos(limit),
  ]);

  if (topBoosted.status !== "ok") {
    if (lastMemberPicks) {
      return lastMemberPicks.slice(0, limit);
    }

    throw new Error(`Failed to fetch member picks: ${topBoosted.status}`);
  }

  const boostMap = new Map(topBoosted.rows.map((b) => [b.videoId, b.count]));

  const boostedRecordings = allRecordings
    .filter((r) => boostMap.has(r.shortId))
    .map((r) => ({
      ...r,
      boostCount: boostMap.get(r.shortId) ?? 0,
    }))
    .sort(compareByBoostCountDesc)
    .slice(0, limit);

  if (boostedRecordings.length >= limit) {
    lastMemberPicks = boostedRecordings;
    return boostedRecordings;
  }

  const usedIds = new Set(boostedRecordings.map((r) => r.shortId));
  const backfillCount = limit - boostedRecordings.length;

  const newestFeaturedBackfill = createFeaturedBackfill(
    allRecordings,
    backfillCount,
    { boostCount: 0 },
    usedIds,
  );

  if (boostedRecordings.length + newestFeaturedBackfill.length >= limit) {
    const picks = [...boostedRecordings, ...newestFeaturedBackfill];

    if (boostedRecordings.length > 0) {
      lastMemberPicks = picks;
    }

    return picks;
  }

  const stillNeeded = limit - boostedRecordings.length - newestFeaturedBackfill.length;
  const allUsedIds = new Set([...usedIds, ...newestFeaturedBackfill.map((r) => r.shortId)]);

  const newestRemainingBackfill = createRecentBackfill(
    allRecordings,
    stillNeeded,
    { boostCount: 0 },
    allUsedIds,
  );

  const picks = [...boostedRecordings, ...newestFeaturedBackfill, ...newestRemainingBackfill];

  if (boostedRecordings.length > 0) {
    lastMemberPicks = picks;
  }

  return picks;
}

const createMemberPicksBackfill = (
  allRecordings: Recording[],
  limit: number,
): MemberPickRecording[] => createFeaturedBackfill(allRecordings, limit, { boostCount: 0 });

export async function getMemberPicksSafe(limit = 6): Promise<MemberPickRecording[]> {
  if (shouldDisableDbDuringBuild()) {
    const allRecordings = getAllRecordings();
    return createMemberPicksBackfill(allRecordings, limit);
  }

  try {
    return await getMemberPicks(limit);
  } catch {
    const allRecordings = getAllRecordings();
    return createMemberPicksBackfill(allRecordings, limit);
  }
}
