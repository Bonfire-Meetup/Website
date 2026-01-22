import { unstable_cache } from "next/cache";
import { getAllRecordings, type Recording } from "./recordings";
import { getDatabaseClient } from "../data/db";

export type MemberPickRecording = Recording & {
  boostCount: number;
};

type BoostRow = { video_id: string; count: number };

const fetchTopBoostedVideos = async (
  limit: number,
): Promise<{ videoId: string; count: number }[]> => {
  const sql = getDatabaseClient({ required: false });
  if (!sql) return [];

  try {
    const rows = (await sql`
      SELECT video_id, COUNT(*)::int as count
      FROM video_boosts
      GROUP BY video_id
      ORDER BY count DESC
      LIMIT ${limit * 2}
    `) as BoostRow[];

    return rows.map((row) => ({ videoId: row.video_id, count: row.count }));
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

  // Backfill with newest featured videos (different from hot which uses oldest classics)
  const usedIds = new Set(boostedRecordings.map((r) => r.shortId));
  const backfillCount = limit - boostedRecordings.length;

  const backfill = allRecordings
    .filter((r) => !usedIds.has(r.shortId) && r.featureHeroThumbnail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, backfillCount)
    .map((r) => ({ ...r, boostCount: 0 }));

  if (boostedRecordings.length + backfill.length >= limit) {
    return [...boostedRecordings, ...backfill];
  }

  // Final backfill with newest remaining videos
  const stillNeeded = limit - boostedRecordings.length - backfill.length;
  const allUsedIds = new Set([...usedIds, ...backfill.map((r) => r.shortId)]);

  const remainingBackfill = allRecordings
    .filter((r) => !allUsedIds.has(r.shortId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, stillNeeded)
    .map((r) => ({ ...r, boostCount: 0 }));

  return [...boostedRecordings, ...backfill, ...remainingBackfill];
};

export const getMemberPicks = unstable_cache(getMemberPicksUncached, ["member-picks"], {
  revalidate: 3600,
});
