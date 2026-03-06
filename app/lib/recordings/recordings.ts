import { cache } from "react";

import pragueRecordingsData from "@/data/prague-recordings.json";
import zlinRecordingsData from "@/data/zlin-recordings.json";
import { LOCATIONS, type LocationValue } from "@/lib/config/constants";

import {
  type RecordingAccessPolicy,
  normalizeLegacyEarlyAccess,
  normalizeRecordingAccessPolicy,
} from "./early-access";
import { getEpisodeById } from "./episodes";
import {
  calculateRelatedBaseScore,
  calculateRelatedDiversityPenalty,
  calculateRelatedExplorePenalty,
} from "./recommendation-scoring";

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
  access?: RecordingAccessPolicy;
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
      access:
        normalizeRecordingAccessPolicy((recording as { access?: unknown }).access) ??
        normalizeLegacyEarlyAccess((recording as { earlyAccess?: unknown }).earlyAccess),
      location: LOCATIONS.PRAGUE,
      tags: recording.tags.map((tag) => tag.toLowerCase()),
    })),
    ...zlinRecordingsData.recordings.map((recording) => ({
      ...recording,
      access:
        normalizeRecordingAccessPolicy((recording as { access?: unknown }).access) ??
        normalizeLegacyEarlyAccess((recording as { earlyAccess?: unknown }).earlyAccess),
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

  const candidates = allRecordings
    .filter((r) => r.youtubeId !== recording.youtubeId)
    .map((r) => {
      const dateMs = new Date(r.date).getTime();
      const sharedTags = countSharedTags(r.tags);
      const sharedSpeakers = countSharedSpeakers(r.speaker);
      const hasRecordingEpisode = Boolean(recording.episode);
      const hasREpisode = Boolean(r.episode);
      const areEpisodesEqual = r.episode === recording.episode;
      const sameEpisode = hasRecordingEpisode && hasREpisode && areEpisodesEqual;
      const sameLocation = r.location === recording.location;

      return {
        date: dateMs,
        recording: r,
        sameEpisode,
        sameLocation,
        score: calculateRelatedBaseScore({
          sourceDateMs: recordingDate,
          candidateDateMs: dateMs,
          sharedTagCount: sharedTags,
          sharedSpeakerCount: sharedSpeakers,
          sameEpisode,
          sameLocation,
        }),
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

  const firstMatchIndex = poolDefinitions.findIndex((pool) => pool.hasMatches);
  const initialPoolIndex = firstMatchIndex >= 0 ? firstMatchIndex : poolDefinitions.length - 1;

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

  const findBestCandidate = (
    pool: (typeof candidates)[number][],
    options: { allowSameEpisode: boolean; applyDiversityPenalty: boolean },
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
          const selectedAlreadyHasEpisode = candidate.recording.episode
            ? usedEpisodes.has(candidate.recording.episode)
            : false;
          const diversityPenalty = calculateRelatedDiversityPenalty({
            sharedWithSelectedTags,
            sharedWithSelectedSpeakers,
            selectedAlreadyHasEpisode,
          });
          const rankedScore =
            candidate.score - (options.applyDiversityPenalty ? diversityPenalty : 0);

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
    options: { allowSameEpisode: boolean; applyDiversityPenalty: boolean },
    targetCount: number,
  ) => {
    while (selected.length < targetCount) {
      const best = findBestCandidate(pool, options);

      if (!best) {
        break;
      }

      addCandidate(best);
    }
  };

  const pickExploreCandidate = () => {
    let best: (typeof candidates)[number] | null = null;
    let bestScore = -Infinity;

    for (const candidate of candidates) {
      if (!usedIds.has(candidate.recording.shortId)) {
        const sharedWithSelectedTags = candidate.recording.tags.filter((tag) =>
          usedTags.has(tag),
        ).length;
        const sharedWithSelectedSpeakers = candidate.speakersLower.filter((name) =>
          usedSpeakers.has(name),
        ).length;
        const selectedAlreadyHasEpisode = candidate.recording.episode
          ? usedEpisodes.has(candidate.recording.episode)
          : false;
        const overlapPenalty = calculateRelatedExplorePenalty({
          sharedWithSelectedTags,
          sharedWithSelectedSpeakers,
          selectedAlreadyHasEpisode,
          sameLocation: candidate.sameLocation,
        });
        const rankedScore = candidate.score - overlapPenalty;

        if (rankedScore > bestScore) {
          best = candidate;
          bestScore = rankedScore;
        } else if (rankedScore === bestScore && best) {
          if (candidate.date > best.date) {
            best = candidate;
          } else if (
            candidate.date === best.date &&
            candidate.recording.title.localeCompare(best.recording.title) < 0
          ) {
            best = candidate;
          }
        }
      }
    }

    return best;
  };

  const initialPool = candidates.filter(orderedPools[0].isMatch);
  const exploreSlotEnabled = maxCount > 1;
  const targetCount = exploreSlotEnabled ? maxCount - 1 : maxCount;
  const nextUpCandidate = findBestCandidate(initialPool, {
    allowSameEpisode: true,
    applyDiversityPenalty: false,
  });

  if (nextUpCandidate) {
    addCandidate(nextUpCandidate);
  }

  fillFromPool(
    initialPool,
    {
      allowSameEpisode: false,
      applyDiversityPenalty: true,
    },
    targetCount,
  );

  for (const poolDefinition of orderedPools.slice(1)) {
    if (selected.length >= targetCount) {
      break;
    }

    const pool = candidates.filter(poolDefinition.isMatch);
    fillFromPool(
      pool,
      {
        allowSameEpisode: false,
        applyDiversityPenalty: true,
      },
      targetCount,
    );
  }

  if (selected.length < targetCount) {
    fillFromPool(
      candidates,
      {
        allowSameEpisode: true,
        applyDiversityPenalty: true,
      },
      targetCount,
    );
  }

  if (exploreSlotEnabled && selected.length < maxCount) {
    const exploreCandidate = pickExploreCandidate();
    if (exploreCandidate) {
      addCandidate(exploreCandidate);
    }
  }

  return selected;
}
