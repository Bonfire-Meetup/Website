import { cacheLife, cacheTag } from "next/cache";

import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";

import { fetchEngagementCounts } from "../data/trending";

import { type Recording, getAllRecordings } from "./recordings";

export type HotRecording = Recording & {
  likeCount: number;
  hotScore: number;
};

let lastHotRecordings: HotRecording[] | null = null;

function calculateHotScore(likeCount: number, recordingDate: Date, now: number): number {
  let score = likeCount * 10;

  const daysSince = Math.floor((now - recordingDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSince <= 90) {
    score += 3;
  } else if (daysSince <= 180) {
    score += 2;
  } else if (daysSince <= 365) {
    score += 1;
  }

  return score;
}

export async function getHotRecordings(limit = 6): Promise<HotRecording[]> {
  "use cache";
  cacheTag("hot-picks", "engagement-counts");
  cacheLife({ revalidate: CACHE_LIFETIMES.HOT_PICKS });

  const [allRecordings, engagement] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchEngagementCounts(),
  ]);

  const now = Date.now();

  const withLikes = allRecordings
    .map((recording) => {
      const likeCount = engagement.likes[recording.shortId] ?? 0;
      const hotScore = calculateHotScore(likeCount, new Date(recording.date), now);

      return { ...recording, hotScore, likeCount };
    })
    .filter((r) => r.likeCount > 0)
    .sort((a, b) => {
      if (b.hotScore !== a.hotScore) {
        return b.hotScore - a.hotScore;
      }

      return b.likeCount - a.likeCount;
    });

  if (withLikes.length === 0) {
    return lastHotRecordings ? lastHotRecordings.slice(0, limit) : [];
  }

  const selected: HotRecording[] = [];
  const usedLocations = new Map<string, number>();
  const maxPerLocation = Math.ceil(limit / 2) + 1;

  for (const recording of withLikes) {
    if (selected.length >= limit) {
      break;
    }

    const locationCount = usedLocations.get(recording.location) ?? 0;

    if (locationCount < maxPerLocation) {
      selected.push(recording);
      usedLocations.set(recording.location, locationCount + 1);
    }
  }

  if (selected.length < limit) {
    for (const recording of withLikes) {
      if (selected.length >= limit) {
        break;
      }

      if (!selected.some((r) => r.shortId === recording.shortId)) {
        selected.push(recording);
      }
    }
  }

  if (selected.length < limit) {
    const usedIds = new Set(selected.map((r) => r.shortId));

    const recentBackfill = allRecordings
      .filter((r) => !usedIds.has(r.shortId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit - selected.length)
      .map((r) => ({ ...r, hotScore: 0, likeCount: 0 }));

    selected.push(...recentBackfill);
  }

  if (withLikes.length > 0) {
    lastHotRecordings = selected;
  }

  return selected;
}

const createHotBackfill = (allRecordings: Recording[], limit: number): HotRecording[] =>
  allRecordings
    .filter((r) => r.featureHeroThumbnail)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit)
    .map((r) => ({ ...r, hotScore: 0, likeCount: 0 }));

export async function getHotRecordingsSafe(limit = 6): Promise<HotRecording[]> {
  try {
    return await getHotRecordings(limit);
  } catch {
    const allRecordings = getAllRecordings();
    return createHotBackfill(allRecordings, limit);
  }
}
