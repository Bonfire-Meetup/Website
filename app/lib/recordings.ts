import { cache } from "react";
import { LOCATIONS, type LocationValue } from "./constants";
import pragueRecordingsData from "../data/prague-recordings.json";
import zlinRecordingsData from "../data/zlin-recordings.json";

export type Recording = {
  youtubeId: string;
  shortId: string;
  slug: string;
  title: string;
  speaker: string[];
  date: string;
  thumbnail: string;
  featureHeroThumbnail?: string;
  url: string;
  description: string | null;
  tags: string[];
  location: LocationValue;
  episode?: string;
  episodeNumber?: number;
};

export const getAllRecordings = cache((): Recording[] => {
  return [
    ...pragueRecordingsData.recordings.map((recording) => ({
      ...recording,
      tags: recording.tags.map((tag) => tag.toLowerCase()),
      location: LOCATIONS.PRAGUE,
    })),
    ...zlinRecordingsData.recordings.map((recording) => ({
      ...recording,
      tags: recording.tags.map((tag) => tag.toLowerCase()),
      location: LOCATIONS.ZLIN,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
});

export function getRecordingBySlug(slug: string): Recording | undefined {
  return getAllRecordings().find((recording) => recording.slug === slug);
}

export function getRelatedRecordings(
  recording: Recording,
  allRecordings: Recording[],
  limit = 4,
): Recording[] {
  const recordingTags = new Set(recording.tags.map((tag) => tag.toLowerCase()));
  const recordingSpeakers = new Set(recording.speaker.map((name) => name.toLowerCase()));
  const recordingDate = new Date(recording.date).getTime();

  const countSharedTags = (tags: string[]) => tags.filter((tag) => recordingTags.has(tag)).length;
  const countSharedSpeakers = (speakers: string[]) =>
    speakers.map((name) => name.toLowerCase()).filter((name) => recordingSpeakers.has(name)).length;

  const getScore = (r: Recording) => {
    let score = 0;
    const sharedTags = Math.min(countSharedTags(r.tags), 3);
    const sharedSpeakers = Math.min(countSharedSpeakers(r.speaker), 2);
    const sameEpisode = Boolean(r.episode && recording.episode && r.episode === recording.episode);

    if (sameEpisode) score += 6;
    if (r.location === recording.location) score += 2;
    score += sharedTags * 3;
    score += sharedSpeakers * 4;

    const daysSince = Math.max(
      0,
      Math.floor((recordingDate - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24)),
    );
    if (daysSince <= 90) score += 2;
    else if (daysSince <= 180) score += 1;

    return score;
  };

  const candidates = allRecordings
    .filter((r) => r.youtubeId !== recording.youtubeId)
    .map((r) => {
      const sharedTags = countSharedTags(r.tags);
      const sharedSpeakers = countSharedSpeakers(r.speaker);
      const sameEpisode = Boolean(
        r.episode && recording.episode && r.episode === recording.episode,
      );
      const sameLocation = r.location === recording.location;
      return {
        recording: r,
        score: getScore(r),
        sharedTags,
        sharedSpeakers,
        sameEpisode,
        sameLocation,
        date: new Date(r.date).getTime(),
        speakersLower: r.speaker.map((name) => name.toLowerCase()),
      };
    });

  const hasTagMatches = candidates.some((item) => item.sharedTags > 0);
  const hasSpeakerMatches = candidates.some((item) => item.sharedSpeakers > 0);
  const hasEpisodeMatches = candidates.some((item) => item.sameEpisode);
  const hasLocationMatches = candidates.some((item) => item.sameLocation);

  const pool = hasTagMatches
    ? candidates.filter((item) => item.sharedTags > 0)
    : hasSpeakerMatches
      ? candidates.filter((item) => item.sharedSpeakers > 0)
      : hasEpisodeMatches
        ? candidates.filter((item) => item.sameEpisode)
        : hasLocationMatches
          ? candidates.filter((item) => item.sameLocation)
          : candidates;

  const selected: Recording[] = [];
  const usedEpisodes = new Set<string>();
  const usedSpeakers = new Set<string>();
  const usedTags = new Set<string>();
  const usedIds = new Set<string>();

  const maxCount = Math.min(limit, pool.length);

  const nextUpCandidate = pool.reduce<(typeof pool)[number] | null>((best, candidate) => {
    if (!best) return candidate;
    if (candidate.sharedTags !== best.sharedTags) {
      return candidate.sharedTags > best.sharedTags ? candidate : best;
    }
    if (candidate.sharedSpeakers !== best.sharedSpeakers) {
      return candidate.sharedSpeakers > best.sharedSpeakers ? candidate : best;
    }
    if (candidate.sameEpisode !== best.sameEpisode) {
      return candidate.sameEpisode ? candidate : best;
    }
    if (candidate.score !== best.score) {
      return candidate.score > best.score ? candidate : best;
    }
    if (candidate.date !== best.date) {
      return candidate.date > best.date ? candidate : best;
    }
    return candidate.recording.title.localeCompare(best.recording.title) < 0 ? candidate : best;
  }, null);

  if (nextUpCandidate) {
    selected.push(nextUpCandidate.recording);
    usedIds.add(nextUpCandidate.recording.shortId);
    if (nextUpCandidate.recording.episode) {
      usedEpisodes.add(nextUpCandidate.recording.episode);
    }
    nextUpCandidate.speakersLower.forEach((name) => usedSpeakers.add(name));
    nextUpCandidate.recording.tags.forEach((tag) => usedTags.add(tag));
  }

  for (let i = selected.length; i < maxCount; i += 1) {
    let best: (typeof pool)[number] | null = null;
    let bestScore = -Infinity;

    for (const candidate of pool) {
      if (usedIds.has(candidate.recording.shortId)) continue;
      if (candidate.recording.episode && usedEpisodes.has(candidate.recording.episode)) continue;

      const sharedWithSelectedTags = candidate.recording.tags.filter((tag) =>
        usedTags.has(tag),
      ).length;
      const sharedWithSelectedSpeakers = candidate.speakersLower.filter((name) =>
        usedSpeakers.has(name),
      ).length;
      const tagPenalty = hasTagMatches && candidate.sharedTags === 0 ? 4 : 0;
      const diversityPenalty = sharedWithSelectedTags * 2 + sharedWithSelectedSpeakers * 4;
      const rankedScore = candidate.score - diversityPenalty - tagPenalty;

      if (rankedScore > bestScore) {
        best = candidate;
        bestScore = rankedScore;
        continue;
      }

      if (rankedScore === bestScore && best) {
        if (candidate.date > best.date) {
          best = candidate;
          continue;
        }
        if (candidate.date === best.date) {
          if (candidate.recording.title.localeCompare(best.recording.title) < 0) {
            best = candidate;
          }
        }
      }
    }

    if (!best) break;
    selected.push(best.recording);
    usedIds.add(best.recording.shortId);
    if (best.recording.episode) {
      usedEpisodes.add(best.recording.episode);
    }
    best.speakersLower.forEach((name) => usedSpeakers.add(name));
    best.recording.tags.forEach((tag) => usedTags.add(tag));
  }

  return selected;
}
