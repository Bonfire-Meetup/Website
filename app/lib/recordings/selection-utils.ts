import type { Recording } from "./recordings";

export function sortByRecordingDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function fillUniqueByShortId<T extends { shortId: string }>(
  selected: T[],
  candidates: T[],
  limit: number,
): T[] {
  if (selected.length >= limit) {
    return selected.slice(0, limit);
  }

  const next = [...selected];
  const usedIds = new Set(next.map((item) => item.shortId));

  for (const candidate of candidates) {
    if (next.length >= limit) {
      break;
    }

    if (!usedIds.has(candidate.shortId)) {
      next.push(candidate);
      usedIds.add(candidate.shortId);
    }
  }

  return next;
}

export function createFeaturedBackfill<TMetrics extends object>(
  allRecordings: Recording[],
  limit: number,
  metrics: TMetrics,
  usedIds?: Set<string>,
): (Recording & TMetrics)[] {
  return sortByRecordingDateDesc(
    allRecordings.filter(
      (recording) =>
        recording.featureHeroThumbnail && (!usedIds || !usedIds.has(recording.shortId)),
    ),
  )
    .slice(0, limit)
    .map((recording) => ({ ...recording, ...metrics }));
}

export function createRecentBackfill<TMetrics extends object>(
  allRecordings: Recording[],
  limit: number,
  metrics: TMetrics,
  usedIds?: Set<string>,
): (Recording & TMetrics)[] {
  return sortByRecordingDateDesc(
    allRecordings.filter((recording) => !usedIds || !usedIds.has(recording.shortId)),
  )
    .slice(0, limit)
    .map((recording) => ({ ...recording, ...metrics }));
}
