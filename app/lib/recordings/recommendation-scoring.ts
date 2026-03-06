const DAY_IN_MS = 1000 * 60 * 60 * 24;

export interface RelatedRecencyScoreInput {
  sourceDateMs: number;
  candidateDateMs: number;
}

export function getRelatedRecencyScore({
  sourceDateMs,
  candidateDateMs,
}: RelatedRecencyScoreInput): number {
  const daysDiff = Math.floor(Math.abs(sourceDateMs - candidateDateMs) / DAY_IN_MS);

  if (daysDiff <= 365) {
    return 2;
  }

  if (daysDiff <= 730) {
    return 1;
  }

  return 0;
}

export interface RelatedBaseScoreInput {
  sourceDateMs: number;
  candidateDateMs: number;
  sharedTagCount: number;
  sharedSpeakerCount: number;
  sameEpisode: boolean;
  sameLocation: boolean;
}

export function calculateRelatedBaseScore({
  sourceDateMs,
  candidateDateMs,
  sharedTagCount,
  sharedSpeakerCount,
  sameEpisode,
  sameLocation,
}: RelatedBaseScoreInput): number {
  let score = 0;
  const cappedSharedTags = Math.min(sharedTagCount, 3);
  const cappedSharedSpeakers = Math.min(sharedSpeakerCount, 2);

  if (sameEpisode) {
    score += 6;
  }

  if (sameLocation) {
    score += 2;
  }

  score += cappedSharedTags * 3;
  score += cappedSharedSpeakers * 4;
  score += getRelatedRecencyScore({ sourceDateMs, candidateDateMs });

  return score;
}

export interface RelatedDiversityPenaltyInput {
  sharedWithSelectedTags: number;
  sharedWithSelectedSpeakers: number;
  selectedAlreadyHasEpisode: boolean;
}

export function calculateRelatedDiversityPenalty({
  sharedWithSelectedTags,
  sharedWithSelectedSpeakers,
  selectedAlreadyHasEpisode,
}: RelatedDiversityPenaltyInput): number {
  const episodePenalty = selectedAlreadyHasEpisode ? 3 : 0;
  return sharedWithSelectedTags + sharedWithSelectedSpeakers * 4 + episodePenalty;
}

export interface RelatedExplorePenaltyInput {
  sharedWithSelectedTags: number;
  sharedWithSelectedSpeakers: number;
  selectedAlreadyHasEpisode: boolean;
  sameLocation: boolean;
}

export function calculateRelatedExplorePenalty({
  sharedWithSelectedTags,
  sharedWithSelectedSpeakers,
  selectedAlreadyHasEpisode,
  sameLocation,
}: RelatedExplorePenaltyInput): number {
  const episodePenalty = selectedAlreadyHasEpisode ? 4 : 0;
  const locationPenalty = sameLocation ? 1 : 0;

  return (
    sharedWithSelectedTags * 2 + sharedWithSelectedSpeakers * 3 + episodePenalty + locationPenalty
  );
}
