import { neon } from "@neondatabase/serverless";
import { cache } from "react";
import { getAllRecordings, type Recording } from "./recordings";

type LikeCounts = Record<string, number>;

const getSql = () => {
  const url = process.env.BNF_NEON_DATABASE_URL;
  if (!url) return null;
  return neon(url);
};

async function fetchLikeCounts(): Promise<LikeCounts> {
  const sql = getSql();
  if (!sql) return {};

  try {
    const rows = (await sql`
      SELECT video_id, COUNT(*)::int as count
      FROM video_likes
      GROUP BY video_id
    `) as { video_id: string; count: number }[];

    return Object.fromEntries(rows.map((row) => [row.video_id, row.count]));
  } catch {
    return {};
  }
}

function calculateTrendingScore(recording: Recording, likeCount: number, now: number): number {
  let score = 0;

  score += likeCount * 3;

  const recordingDate = new Date(recording.date).getTime();
  const daysSince = Math.floor((now - recordingDate) / (1000 * 60 * 60 * 24));

  if (daysSince <= 120) score += 10;
  else if (daysSince <= 240) score += 7;
  else if (daysSince <= 365) score += 4;
  else if (daysSince <= 540) score += 2;

  if (recording.featureHeroThumbnail) score += 3;

  return score;
}

export type TrendingRecording = Recording & { likeCount: number; trendingScore: number };

export const getTrendingRecordings = cache(async (limit = 6): Promise<TrendingRecording[]> => {
  const [allRecordings, likeCounts] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchLikeCounts(),
  ]);

  const now = Date.now();

  const scored = allRecordings.map((recording) => {
    const likeCount = likeCounts[recording.shortId] ?? 0;
    const trendingScore = calculateTrendingScore(recording, likeCount, now);
    return { ...recording, likeCount, trendingScore };
  });

  scored.sort((a, b) => {
    if (b.trendingScore !== a.trendingScore) {
      return b.trendingScore - a.trendingScore;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const selected: TrendingRecording[] = [];
  const usedLocations = new Map<string, number>();
  const usedQuarters = new Map<string, number>();
  const maxPerQuarter = Math.max(1, Math.ceil(limit / 3));

  for (const recording of scored) {
    if (selected.length >= limit) break;

    const locationCount = usedLocations.get(recording.location) ?? 0;
    if (locationCount >= Math.ceil(limit / 2)) continue;
    const recordingDate = new Date(recording.date);
    const quarterKey = `${recordingDate.getFullYear()}-Q${Math.floor(recordingDate.getMonth() / 3) + 1}`;
    const quarterCount = usedQuarters.get(quarterKey) ?? 0;
    if (quarterCount >= maxPerQuarter) continue;

    selected.push(recording);
    usedLocations.set(recording.location, locationCount + 1);
    usedQuarters.set(quarterKey, quarterCount + 1);
  }

  if (selected.length < limit) {
    for (const recording of scored) {
      if (selected.length >= limit) break;
      if (selected.some((r) => r.shortId === recording.shortId)) continue;
      selected.push(recording);
    }
  }

  return selected;
});
