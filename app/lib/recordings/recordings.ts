import { cache } from "react";

import pragueRecordingsData from "@/data/prague-recordings.json";
import zlinRecordingsData from "@/data/zlin-recordings.json";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";

import { getEpisodeById } from "./episodes";

export interface Recording {
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
  episodeId?: string;
  episode?: string;
  episodeNumber?: number;
}

function withEpisode(recording: Recording) {
  if (!recording.episodeId) {
    return recording;
  }

  const episode = getEpisodeById(recording.episodeId);

  if (!episode) {
    return recording;
  }

  return {
    ...recording,
    episode: episode.title,
    episodeNumber: episode.number,
  };
}

export const getAllRecordings = cache((): Recording[] =>
  [
    ...pragueRecordingsData.recordings.map((recording) => ({
      ...recording,
      location: LOCATIONS.PRAGUE,
      tags: recording.tags.map((tag) => tag.toLowerCase()),
    })),
    ...zlinRecordingsData.recordings.map((recording) => ({
      ...recording,
      location: LOCATIONS.ZLIN,
      tags: recording.tags.map((tag) => tag.toLowerCase()),
    })),
  ]
    .map((recording) => withEpisode(recording))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
);

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

    if (sameEpisode) {
      score += 6;
    }

    if (r.location === recording.location) {
      score += 2;
    }

    score += sharedTags * 3;
    score += sharedSpeakers * 4;

    const daysSince = Math.max(
      0,
      Math.floor((recordingDate - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24)),
    );

    if (daysSince <= 90) {
      score += 2;
    } else if (daysSince <= 180) {
      score += 1;
    }

    return score;
  };

  const candidates = allRecordings
    .filter((r) => r.youtubeId !== recording.youtubeId)
    .map((r) => {
      const sharedTags = countSharedTags(r.tags);
      const sharedSpeakers = countSharedSpeakers(r.speaker);
      const hasRecordingEpisode = Boolean(recording.episode);
      const hasREpisode = Boolean(r.episode);
      const areEpisodesEqual = r.episode === recording.episode;
      const sameEpisode = hasRecordingEpisode && hasREpisode && areEpisodesEqual;
      const sameLocation = r.location === recording.location;

      return {
        date: new Date(r.date).getTime(),
        recording: r,
        sameEpisode,
        sameLocation,
        score: getScore(r),
        sharedSpeakers,
        sharedTags,
        speakersLower: r.speaker.map((name) => name.toLowerCase()),
      };
    });

  const hasTagMatches = candidates.some((item) => item.sharedTags > 0);
  const hasSpeakerMatches = candidates.some((item) => item.sharedSpeakers > 0);
  const hasEpisodeMatches = candidates.some((item) => item.sameEpisode);
  const hasLocationMatches = candidates.some((item) => item.sameLocation);

  const selected: Recording[] = [];
  const usedEpisodes = new Set<string>();
  const usedSpeakers = new Set<string>();
  const usedTags = new Set<string>();
  const usedIds = new Set<string>();

  const maxCount = Math.min(limit, candidates.length);

  const poolDefinitions = [
    {
      hasMatches: hasTagMatches,
      isMatch: (item: (typeof candidates)[number]) => item.sharedTags > 0,
      key: "tags",
    },
    {
      hasMatches: hasSpeakerMatches,
      isMatch: (item: (typeof candidates)[number]) => item.sharedSpeakers > 0,
      key: "speakers",
    },
    {
      hasMatches: hasEpisodeMatches,
      isMatch: (item: (typeof candidates)[number]) => item.sameEpisode,
      key: "episode",
    },
    {
      hasMatches: hasLocationMatches,
      isMatch: (item: (typeof candidates)[number]) => item.sameLocation,
      key: "location",
    },
    {
      hasMatches: true,
      isMatch: () => true,
      key: "all",
    },
  ];

  const initialPoolIndex =
    poolDefinitions.findIndex((pool) => pool.hasMatches) >= 0
      ? poolDefinitions.findIndex((pool) => pool.hasMatches)
      : poolDefinitions.length - 1;

  const orderedPools = poolDefinitions.slice(initialPoolIndex);

  const addCandidate = (candidate: (typeof candidates)[number]) => {
    selected.push(candidate.recording);
    usedIds.add(candidate.recording.shortId);

    if (candidate.recording.episode) {
      usedEpisodes.add(candidate.recording.episode);
    }

    candidate.speakersLower.forEach((name) => usedSpeakers.add(name));
    candidate.recording.tags.forEach((tag) => usedTags.add(tag));
  };

  const pickNextUp = (pool: (typeof candidates)[number][]) =>
    pool.reduce<(typeof pool)[number] | null>((best, candidate) => {
      if (!best) {
        return candidate;
      }

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

  const findBestCandidate = (
    pool: (typeof candidates)[number][],
    options: { allowSameEpisode: boolean; tagPenaltyEnabled: boolean },
  ) => {
    let best: (typeof pool)[number] | null = null;
    let bestScore = -Infinity;

    for (const candidate of pool) {
      const isNotUsed = !usedIds.has(candidate.recording.shortId);

      if (isNotUsed) {
        const isEpisodeAllowed = options.allowSameEpisode;
        const hasNoEpisode = !candidate.recording.episode;
        const isEpisodeNotUsed = candidate.recording.episode
          ? !usedEpisodes.has(candidate.recording.episode)
          : false;
        const canUseCandidate = isEpisodeAllowed || hasNoEpisode || isEpisodeNotUsed;

        if (canUseCandidate) {
          const sharedWithSelectedTags = candidate.recording.tags.filter((tag) =>
            usedTags.has(tag),
          ).length;
          const sharedWithSelectedSpeakers = candidate.speakersLower.filter((name) =>
            usedSpeakers.has(name),
          ).length;
          const tagPenalty = options.tagPenaltyEnabled && candidate.sharedTags === 0 ? 4 : 0;
          const diversityPenalty = sharedWithSelectedTags * 2 + sharedWithSelectedSpeakers * 4;
          const rankedScore = candidate.score - diversityPenalty - tagPenalty;

          const isBetterScore = rankedScore > bestScore;
          const isSameScore = rankedScore === bestScore;
          const hasBestCandidate = best !== null;

          if (isBetterScore) {
            best = candidate;
            bestScore = rankedScore;
          } else if (isSameScore && hasBestCandidate && best) {
            const currentBest = best;
            const isNewerDate = candidate.date > currentBest.date;
            const isSameDate = candidate.date === currentBest.date;
            const isAlphabeticallyFirst =
              candidate.recording.title.localeCompare(currentBest.recording.title) < 0;

            if (isNewerDate) {
              best = candidate;
            } else if (isSameDate && isAlphabeticallyFirst) {
              best = candidate;
            }
          }
        }
      }
    }

    return best;
  };

  const fillFromPool = (
    pool: (typeof candidates)[number][],
    options: { allowSameEpisode: boolean; tagPenaltyEnabled: boolean },
  ) => {
    while (selected.length < maxCount) {
      const best = findBestCandidate(pool, options);

      if (!best) {
        break;
      }

      addCandidate(best);
    }
  };

  const initialPool = candidates.filter(orderedPools[0].isMatch);
  const nextUpCandidate = pickNextUp(initialPool);

  if (nextUpCandidate) {
    addCandidate(nextUpCandidate);
  }

  fillFromPool(initialPool, {
    allowSameEpisode: false,
    tagPenaltyEnabled: orderedPools[0].key === "tags",
  });

  for (const poolDefinition of orderedPools.slice(1)) {
    if (selected.length >= maxCount) {
      break;
    }

    const pool = candidates.filter(poolDefinition.isMatch);
    fillFromPool(pool, { allowSameEpisode: false, tagPenaltyEnabled: false });
  }

  if (selected.length < maxCount) {
    fillFromPool(candidates, { allowSameEpisode: true, tagPenaltyEnabled: false });
  }

  return selected;
}
