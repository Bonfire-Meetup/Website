import { NextResponse } from "next/server";

import { upcomingEvents } from "@/data/upcoming-events";
import { PUBLIC_ROLES, type UserRole } from "@/lib/config/roles";
import { getAuthUserById } from "@/lib/data/auth";
import { getUserBoosts } from "@/lib/data/boosts";
import { getUserCheckIns } from "@/lib/data/check-in";
import { getEpisodeById } from "@/lib/recordings/episodes";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";
import { decompressUuid } from "@/lib/utils/uuid-compress";

export const GET = async (request: Request, { params }: { params: Promise<{ id: string }> }) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    try {
      const { id } = await params;
      const userId = decompressUuid(id);

      if (!userId) {
        return respond({ error: "invalid_id" }, { status: 400 });
      }

      const user = await getAuthUserById(userId);
      if (!user) {
        return respond({ error: "not_found" }, { status: 404 });
      }
      if (!(user.preferences.publicProfile ?? false)) {
        return respond({ error: "private_profile" }, { status: 403 });
      }

      const boosts = await getUserBoosts(userId);
      const recordings = getAllRecordings();
      const recordingMap = new Map(recordings.map((recording) => [recording.shortId, recording]));

      const getWatchSlug = (recording: { slug: string; shortId: string }) =>
        `${recording.slug}-${recording.shortId}`;

      const boostItems = boosts
        .map((boost) => {
          const recording = recordingMap.get(boost.videoId);

          if (!recording) {
            return null;
          }

          return {
            date: recording.date,
            shortId: recording.shortId,
            slug: getWatchSlug(recording),
            speaker: recording.speaker,
            title: recording.title,
          };
        })
        .filter((item) => item !== null);

      const userRoles = user.roles.filter((role): role is UserRole =>
        PUBLIC_ROLES.includes(role as UserRole),
      );

      const checkIns = await getUserCheckIns(userId);
      const checkInEventIds = new Set(checkIns.map((ci) => ci.eventId));

      const events = [];
      for (const eventId of checkInEventIds) {
        const upcomingEvent = upcomingEvents.find((e) => e.id === eventId);
        if (upcomingEvent) {
          events.push({
            id: upcomingEvent.id,
            title: upcomingEvent.title,
            location: upcomingEvent.location,
            date: upcomingEvent.date,
            type: "upcoming" as const,
            checkedInAt: checkIns.find((ci) => ci.eventId === eventId)?.createdAt.toISOString(),
          });
        } else {
          const episode = getEpisodeById(eventId);
          if (episode) {
            events.push({
              id: episode.id,
              title: `Bonfire@${episode.city === "prague" ? "Prague" : "Zlin"} #${episode.number} - ${episode.title}`,
              location: episode.city === "prague" ? "Prague" : "Zlin",
              date: episode.date,
              type: "episode" as const,
              checkedInAt: checkIns.find((ci) => ci.eventId === eventId)?.createdAt.toISOString(),
            });
          }
        }
      }

      events.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      });

      return respond({
        boosts: {
          count: boostItems.length,
          items: boostItems,
        },
        checkIns: {
          count: events.length,
          items: events,
        },
        publicId: id,
        createdAt: user.createdAt.toISOString(),
        name: user.name,
        roles: userRoles,
      });
    } catch (error) {
      logError("user.profile.fetch_failed", error);
      return respond({ error: "internal_error" }, { status: 500 });
    }
  });
