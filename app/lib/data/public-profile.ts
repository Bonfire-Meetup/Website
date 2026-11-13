import "server-only";

import { cache } from "react";

import { hasMembership } from "@/lib/config/membership";
import { PUBLIC_ROLES, type UserRole } from "@/lib/config/roles";
import { getAuthUserById } from "@/lib/data/auth";
import {
  getUserBoostCount,
  getUserBoosts,
  getUserBoostsThisMonth,
  getUserBoostStreak,
} from "@/lib/data/boosts";
import { getUserCheckIns } from "@/lib/data/check-in";
import { getUserQuestionActivityLevel } from "@/lib/data/event-questions";
import {
  getAttendedEvents,
  getUpcomingRsvpEvents,
  type AttendedEvent,
  type UpcomingRsvpEvent,
} from "@/lib/data/profile-events";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { compressUuid } from "@/lib/utils/uuid-compress";

export interface PublicProfileRecording {
  shortId: string;
  slug: string;
  title: string;
  speaker: string | string[];
  date: string;
}

export interface PublicProfile {
  publicId: string;
  name: string | null;
  createdAt: string;
  roles: UserRole[];
  membershipTier: number | null;
  questionActivityLevel: Awaited<ReturnType<typeof getUserQuestionActivityLevel>>;
  stats: {
    boostCount: number;
    boostsThisMonth: number;
    boostStreak: number;
    eventsAttended: number;
    lastBoostedAt: string | null;
    lastCheckedInAt: string | null;
  };
  boostedVideos: PublicProfileRecording[];
  attendedEvents: AttendedEvent[];
  upcomingRsvps: UpcomingRsvpEvent[];
}

export type PublicProfileResult =
  | { status: "ok"; profile: PublicProfile }
  | { status: "not_found" }
  | { status: "private" };

const toIso = (value: string) => new Date(value).toISOString();
const toOptionalIso = (value: string | null | undefined) => (value ? toIso(value) : undefined);

function toProfileRecordings(videoIds: string[]): PublicProfileRecording[] {
  const recordings = new Map(getAllRecordings().map((recording) => [recording.shortId, recording]));

  return videoIds.flatMap((videoId) => {
    const recording = recordings.get(videoId);

    return recording
      ? [
          {
            date: recording.date,
            shortId: recording.shortId,
            slug: `${recording.slug}-${recording.shortId}`,
            speaker: recording.speaker,
            title: recording.title,
          },
        ]
      : [];
  });
}

export const getPublicProfile = cache(async (userId: string): Promise<PublicProfileResult> => {
  const user = await getAuthUserById(userId);

  if (!user) {
    return { status: "not_found" };
  }

  if (!(user.preferences.publicProfile ?? false)) {
    return { status: "private" };
  }

  const now = new Date();
  const [
    boosts,
    checkIns,
    boostCount,
    boostsThisMonth,
    boostStreak,
    questionActivityLevel,
    attendedEvents,
    upcomingRsvps,
  ] = await Promise.all([
    getUserBoosts(userId),
    getUserCheckIns(userId),
    getUserBoostCount(userId),
    getUserBoostsThisMonth(userId),
    getUserBoostStreak(userId),
    getUserQuestionActivityLevel(userId),
    getAttendedEvents(userId, now),
    getUpcomingRsvpEvents(userId, now),
  ]);

  return {
    profile: {
      attendedEvents: attendedEvents.map((event) => ({
        ...event,
        activityAt: toOptionalIso(event.activityAt),
        checkedInAt: toOptionalIso(event.checkedInAt),
        rsvpedAt: toOptionalIso(event.rsvpedAt),
      })),
      boostedVideos: toProfileRecordings(boosts.map((boost) => boost.videoId)),
      createdAt: toIso(user.createdAt),
      membershipTier: hasMembership(user.membershipTier) ? user.membershipTier : null,
      name: user.name,
      publicId: compressUuid(user.id),
      questionActivityLevel,
      roles: user.roles.filter((role): role is UserRole => PUBLIC_ROLES.includes(role as UserRole)),
      stats: {
        boostCount,
        boostsThisMonth,
        boostStreak,
        eventsAttended: attendedEvents.length,
        lastBoostedAt: toOptionalIso(boosts[0]?.createdAt) ?? null,
        lastCheckedInAt: toOptionalIso(checkIns[0]?.createdAt) ?? null,
      },
      upcomingRsvps: upcomingRsvps.map((event) => ({ ...event, rsvpedAt: toIso(event.rsvpedAt) })),
    },
    status: "ok",
  };
});
