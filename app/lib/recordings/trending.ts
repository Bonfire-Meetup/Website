import { cacheLife, cacheTag } from "next/cache";

import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";

import { DEFAULT_ENGAGEMENT_WINDOW_DAYS, fetchWindowedEngagementCounts } from "../data/trending";

import { type Recording, getAllRecordings } from "./recordings";

function calculateTrendingScore(
  recording: Recording,
  recentLikeCount: number,
  recentBoostCount: number,
  totalLikeCount: number,
  totalBoostCount: number,
  now: number,
): number {
  let score = 0;

  score += recentLikeCount * 3;
  score += recentBoostCount * 6;
  score += Math.sqrt(totalLikeCount) * 1.5;
  score += Math.sqrt(totalBoostCount) * 3;

  const recordingDate = new Date(recording.date).getTime();
  const daysSince = Math.floor((now - recordingDate) / (1000 * 60 * 60 * 24));

  if (daysSince <= 120) {
    score += 6;
  } else if (daysSince <= 240) {
    score += 4;
  } else if (daysSince <= 365) {
    score += 2;
  } else if (daysSince <= 540) {
    score += 1;
  }

  if (recording.featureHeroThumbnail) {
    score += 3;
  }

  return score;
}

export type TrendingRecording = Recording & {
  likeCount: number;
  boostCount: number;
  trendingScore: number;
};

export async function getTrendingRecordings(limit = 6): Promise<TrendingRecording[]> {
  "use cache";
  cacheTag(`trending-recordings-${limit}`, "engagement-counts");
  cacheLife({ revalidate: CACHE_LIFETIMES.TRENDING_RECORDINGS });

  const [allRecordings, engagement] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchWindowedEngagementCounts(DEFAULT_ENGAGEMENT_WINDOW_DAYS),
  ]);

  const now = Date.now();

  const scored = allRecordings.map((recording) => {
    const recentLikeCount = engagement.recent.likes[recording.shortId] ?? 0;
    const recentBoostCount = engagement.recent.boosts[recording.shortId] ?? 0;
    const totalLikeCount = engagement.total.likes[recording.shortId] ?? 0;
    const totalBoostCount = engagement.total.boosts[recording.shortId] ?? 0;
    const trendingScore = calculateTrendingScore(
      recording,
      recentLikeCount,
      recentBoostCount,
      totalLikeCount,
      totalBoostCount,
      now,
    );

    return {
      ...recording,
      boostCount: totalBoostCount,
      likeCount: totalLikeCount,
      trendingScore,
    };
  });

  scored.sort((a, b) => {
    if (b.trendingScore !== a.trendingScore) {
      return b.trendingScore - a.trendingScore;
    }

    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const selected: TrendingRecording[] = [];
  const usedLocations = new Map<string, number>();
  const usedEvents = new Map<string, number>();
  const maxPerEvent = Math.min(3, limit);

  for (const recording of scored) {
    if (selected.length >= limit) {
      break;
    }

    const locationCount = usedLocations.get(recording.location) ?? 0;
    const recordingDate = new Date(recording.date);
    const quarterKey = `${recordingDate.getFullYear()}-Q${Math.floor(recordingDate.getMonth() / 3) + 1}`;
    const eventKey = recording.episodeId ?? quarterKey;
    const eventCount = usedEvents.get(eventKey) ?? 0;

    if (locationCount < Math.ceil(limit / 2) && eventCount < maxPerEvent) {
      selected.push(recording);
      usedLocations.set(recording.location, locationCount + 1);
      usedEvents.set(eventKey, eventCount + 1);
    }
  }

  if (selected.length < limit) {
    for (const recording of scored) {
      if (selected.length >= limit) {
        break;
      }

      if (!selected.some((r) => r.shortId === recording.shortId)) {
        selected.push(recording);
      }
    }
  }

  return selected;
}

const createTrendingBackfill = (allRecordings: Recording[], limit: number): TrendingRecording[] =>
  allRecordings
    .filter((r) => r.featureHeroThumbnail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map((r) => ({ ...r, boostCount: 0, likeCount: 0, trendingScore: 0 }));

export async function getTrendingRecordingsSafe(limit = 6): Promise<TrendingRecording[]> {
  try {
    return await getTrendingRecordings(limit);
  } catch {
    const allRecordings = getAllRecordings();
    return createTrendingBackfill(allRecordings, limit);
  }
}
