import { unstable_cache } from "next/cache";
import { getAllRecordings, type Recording } from "./recordings";
import { fetchEngagementCounts } from "../data/trending";

export type HotRecording = Recording & {
  likeCount: number;
  hotScore: number;
};

function calculateHotScore(likeCount: number, recordingDate: Date, now: number): number {
  // Heavily weight likes - this is the primary factor
  let score = likeCount * 10;

  // Small recency bonus to break ties
  const daysSince = Math.floor((now - recordingDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSince <= 90) score += 3;
  else if (daysSince <= 180) score += 2;
  else if (daysSince <= 365) score += 1;

  return score;
}

const getHotRecordingsUncached = async (limit = 6): Promise<HotRecording[]> => {
  const [allRecordings, engagement] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchEngagementCounts(),
  ]);

  const now = Date.now();

  const withLikes = allRecordings
    .map((recording) => {
      const likeCount = engagement.likes[recording.shortId] ?? 0;
      const hotScore = calculateHotScore(likeCount, new Date(recording.date), now);
      return { ...recording, likeCount, hotScore };
    })
    .filter((r) => r.likeCount > 0)
    .sort((a, b) => {
      if (b.hotScore !== a.hotScore) return b.hotScore - a.hotScore;
      return b.likeCount - a.likeCount;
    });

  // Ensure variety by limiting per location
  const selected: HotRecording[] = [];
  const usedLocations = new Map<string, number>();
  const maxPerLocation = Math.ceil(limit / 2) + 1;

  for (const recording of withLikes) {
    if (selected.length >= limit) break;

    const locationCount = usedLocations.get(recording.location) ?? 0;
    if (locationCount >= maxPerLocation) continue;

    selected.push(recording);
    usedLocations.set(recording.location, locationCount + 1);
  }

  // Backfill from remaining liked videos
  if (selected.length < limit) {
    for (const recording of withLikes) {
      if (selected.length >= limit) break;
      if (selected.some((r) => r.shortId === recording.shortId)) continue;
      selected.push(recording);
    }
  }

  // Backfill with older "classic" videos (different from member picks which uses newest)
  // Sort by date ascending to get older proven content
  if (selected.length < limit) {
    const usedIds = new Set(selected.map((r) => r.shortId));

    const classicsBackfill = allRecordings
      .filter((r) => !usedIds.has(r.shortId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit - selected.length)
      .map((r) => ({ ...r, likeCount: 0, hotScore: 0 }));

    selected.push(...classicsBackfill);
  }

  return selected;
};

export const getHotRecordings = unstable_cache(getHotRecordingsUncached, ["hot-picks"], {
  revalidate: 1800, // 30 minutes
});
