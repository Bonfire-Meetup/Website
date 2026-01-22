import { unstable_cache } from "next/cache";

import { fetchEngagementCounts } from "../data/trending";

import { type Recording, getAllRecordings } from "./recordings";

function calculateTrendingScore(
  recording: Recording,
  likeCount: number,
  boostCount: number,
  now: number,
): number {
  let score = 0;

  score += likeCount * 3;
  score += boostCount * 5;

  const recordingDate = new Date(recording.date).getTime();
  const daysSince = Math.floor((now - recordingDate) / (1000 * 60 * 60 * 24));

  if (daysSince <= 120) {
    score += 10;
  } else if (daysSince <= 240) {
    score += 7;
  } else if (daysSince <= 365) {
    score += 4;
  } else if (daysSince <= 540) {
    score += 2;
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

const getTrendingRecordingsUncached = async (limit = 6): Promise<TrendingRecording[]> => {
  const [allRecordings, engagement] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchEngagementCounts(),
  ]);

  const now = Date.now();

  const scored = allRecordings.map((recording) => {
    const likeCount = engagement.likes[recording.shortId] ?? 0;
    const boostCount = engagement.boosts[recording.shortId] ?? 0;
    const trendingScore = calculateTrendingScore(recording, likeCount, boostCount, now);
    return { ...recording, boostCount, likeCount, trendingScore };
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
    if (selected.length >= limit) {
      break;
    }

    const locationCount = usedLocations.get(recording.location) ?? 0;
    const recordingDate = new Date(recording.date);
    const quarterKey = `${recordingDate.getFullYear()}-Q${Math.floor(recordingDate.getMonth() / 3) + 1}`;
    const quarterCount = usedQuarters.get(quarterKey) ?? 0;
    if (locationCount < Math.ceil(limit / 2) && quarterCount < maxPerQuarter) {
      selected.push(recording);
      usedLocations.set(recording.location, locationCount + 1);
      usedQuarters.set(quarterKey, quarterCount + 1);
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
};

export const getTrendingRecordings = (limit = 6): Promise<TrendingRecording[]> => {
  const cachedFn = unstable_cache(
    () => getTrendingRecordingsUncached(limit),
    [`trending-recordings-${limit}`],
    {
      revalidate: 3600,
    },
  );
  return cachedFn();
};
