import { cacheLife, cacheTag } from "next/cache";

import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";

import { fetchEngagementCounts } from "../data/trending";

import { getDailySeed, hashWithDailySeed, isHiddenGemCandidate } from "./engagement-scoring";
import { type Recording, getAllRecordings } from "./recordings";

export type HiddenGemRecording = Recording;

export async function getHiddenGems(limit = 6): Promise<HiddenGemRecording[]> {
  "use cache";
  cacheTag("hidden-gems");
  cacheLife({ revalidate: CACHE_LIFETIMES.HIDDEN_GEMS });

  const [allRecordings, engagement] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchEngagementCounts(),
  ]);

  const now = Date.now();

  const hiddenGems = allRecordings
    .map((recording) => {
      const likeCount = engagement.likes[recording.shortId] ?? 0;
      const boostCount = engagement.boosts[recording.shortId] ?? 0;
      const recordingDate = new Date(recording.date).getTime();
      const daysSince = Math.floor((now - recordingDate) / (1000 * 60 * 60 * 24));

      return {
        ...recording,
        likeCount,
        boostCount,
        daysSince,
        recordingDate,
      };
    })
    .filter((r) =>
      isHiddenGemCandidate({
        likeCount: r.likeCount,
        boostCount: r.boostCount,
        recordingDateMs: r.recordingDate,
        now,
      }),
    )
    .sort((a, b) => {
      const aHasFeatured = Boolean(a.featureHeroThumbnail);
      const bHasFeatured = Boolean(b.featureHeroThumbnail);

      if (aHasFeatured !== bHasFeatured) {
        return bHasFeatured ? 1 : -1;
      }

      return b.recordingDate - a.recordingDate;
    });

  if (hiddenGems.length === 0) {
    return [];
  }

  const today = new Date();
  const seed = getDailySeed(today);
  const shuffled = [...hiddenGems].sort((a, b) => {
    const hashA = hashWithDailySeed(a.shortId, seed);
    const hashB = hashWithDailySeed(b.shortId, seed);

    return hashA - hashB;
  });

  return shuffled
    .slice(0, limit)
    .map(
      ({
        likeCount: _likeCount,
        boostCount: _boostCount,
        daysSince: _daysSince,
        recordingDate: _recordingDate,
        ...recording
      }) => recording,
    );
}
