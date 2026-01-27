import { cacheLife, cacheTag } from "next/cache";

import { fetchEngagementCounts } from "../data/trending";

import { type Recording, getAllRecordings } from "./recordings";

export type HiddenGemRecording = Recording;

export async function getHiddenGems(limit = 6): Promise<HiddenGemRecording[]> {
  "use cache";
  cacheTag("hidden-gems");
  cacheLife({ revalidate: 86400 });

  const [allRecordings, engagement] = await Promise.all([
    Promise.resolve(getAllRecordings()),
    fetchEngagementCounts(),
  ]);

  const now = Date.now();
  const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;

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
    .filter((r) => {
      const isOldEnough = r.recordingDate < sixMonthsAgo;
      const hasLowEngagement = r.likeCount <= 2 && r.boostCount === 0;

      return isOldEnough && hasLowEngagement;
    })
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
  const seed = today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate();
  const shuffled = [...hiddenGems].sort((a, b) => {
    const hashA = (a.shortId.charCodeAt(0) + seed) % 1000;
    const hashB = (b.shortId.charCodeAt(0) + seed) % 1000;

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
