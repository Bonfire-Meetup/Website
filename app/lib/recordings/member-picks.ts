import { unstable_cache } from "next/cache";

import { getDatabaseClient } from "../data/db";

import { type Recording, getAllRecordings } from "./recordings";

export type MemberPickRecording = Recording & {
  boostCount: number;
};

interface BoostRow {
  video_id: string;
  count: number;
}

const fetchTopBoostedVideos = async (
  limit: number,
): Promise<{ videoId: string; count: number }[]> => {
  const sql = getDatabaseClient({ required: false });
  if (!sql) {
    return [];
  }

  try {
    const rows = (await sql`
      SELECT video_id, COUNT(*)::int as count
      FROM video_boosts
      GROUP BY video_id
      ORDER BY count DESC
      LIMIT ${limit * 2}
    `) as BoostRow[];

    return rows.map((row) => ({ count: row.count, videoId: row.video_id }));
  } catch {
    return [];
  }
};

const getMemberPicksUncached = async (limit = 6): Promise<MemberPickRecording[]> => {
  const [allRecordings, topBoosted] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchTopBoostedVideos(limit),
  ]);

  const boostMap = new Map(topBoosted.map((b) => [b.videoId, b.count]));

  const boostedRecordings = allRecordings
    .filter((r) => boostMap.has(r.shortId))
    .map((r) => ({
      ...r,
      boostCount: boostMap.get(r.shortId) ?? 0,
    }))
    .sort((a, b) => b.boostCount - a.boostCount)
    .slice(0, limit);

  if (boostedRecordings.length >= limit) {
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
    return [...boostedRecordings, ...newestFeaturedBackfill];
  }

  const stillNeeded = limit - boostedRecordings.length - newestFeaturedBackfill.length;
  const allUsedIds = new Set([...usedIds, ...newestFeaturedBackfill.map((r) => r.shortId)]);

  const newestRemainingBackfill = allRecordings
    .filter((r) => !allUsedIds.has(r.shortId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, stillNeeded)
    .map((r) => ({ ...r, boostCount: 0 }));

  return [...boostedRecordings, ...newestFeaturedBackfill, ...newestRemainingBackfill];
};

export const getMemberPicks = unstable_cache(getMemberPicksUncached, ["member-picks"], {
  revalidate: 3600,
});
