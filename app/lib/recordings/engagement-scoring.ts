const DAY_IN_MS = 1000 * 60 * 60 * 24;

export interface TrendingScoreInput {
  recentLikeCount: number;
  recentBoostCount: number;
  totalLikeCount: number;
  totalBoostCount: number;
  recordingDateMs: number;
  hasFeatureHeroThumbnail: boolean;
  now: number;
}

export function calculateTrendingScore({
  recentLikeCount,
  recentBoostCount,
  totalLikeCount,
  totalBoostCount,
  recordingDateMs,
  hasFeatureHeroThumbnail,
  now,
}: TrendingScoreInput): number {
  let score = 0;

  score += recentLikeCount * 3;
  score += recentBoostCount * 6;
  score += Math.sqrt(totalLikeCount) * 1.5;
  score += Math.sqrt(totalBoostCount) * 3;

  const daysSince = Math.floor((now - recordingDateMs) / DAY_IN_MS);

  if (daysSince <= 120) {
    score += 6;
  } else if (daysSince <= 240) {
    score += 4;
  } else if (daysSince <= 365) {
    score += 2;
  } else if (daysSince <= 540) {
    score += 1;
  }

  if (hasFeatureHeroThumbnail) {
    score += 3;
  }

  return score;
}

export interface HotScoreInput {
  likeCount: number;
  recordingDateMs: number;
  now: number;
}

export function calculateHotScore({ likeCount, recordingDateMs, now }: HotScoreInput): number {
  let score = likeCount * 10;
  const daysSince = Math.floor((now - recordingDateMs) / DAY_IN_MS);

  if (daysSince <= 90) {
    score += 3;
  } else if (daysSince <= 180) {
    score += 2;
  } else if (daysSince <= 365) {
    score += 1;
  }

  return score;
}

export interface HiddenGemInput {
  likeCount: number;
  boostCount: number;
  recordingDateMs: number;
  now: number;
}

export function isHiddenGemCandidate({
  likeCount,
  boostCount,
  recordingDateMs,
  now,
}: HiddenGemInput): boolean {
  const sixMonthsAgo = now - 180 * DAY_IN_MS;
  const isOldEnough = recordingDateMs < sixMonthsAgo;
  const hasLowEngagement = likeCount <= 2 && boostCount === 0;

  return isOldEnough && hasLowEngagement;
}

export function hashWithDailySeed(shortId: string, seed: number): number {
  let hash = seed;

  for (let i = 0; i < shortId.length; i++) {
    hash = (hash * 31 + shortId.charCodeAt(i)) | 0;
  }

  return hash >>> 0;
}

export function getDailySeed(date: Date): number {
  return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
}

export function compareByBoostCountDesc<
  T extends {
    boostCount: number;
  },
>(a: T, b: T): number {
  return b.boostCount - a.boostCount;
}
