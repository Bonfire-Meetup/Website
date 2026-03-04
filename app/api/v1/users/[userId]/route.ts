import { NextResponse } from "next/server";

import { PUBLIC_ROLES, type UserRole } from "@/lib/config/roles";
import { getAuthUserById } from "@/lib/data/auth";
import { getUserBoosts } from "@/lib/data/boosts";
import { getAttendedEvents } from "@/lib/data/profile-events";
import { getAllRecordings } from "@/lib/recordings/recordings";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";
import { decompressUuid } from "@/lib/utils/uuid-compress";

export const GET = async (request: Request, { params }: { params: Promise<{ userId: string }> }) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    try {
      const { userId: publicId } = await params;
      const userId = decompressUuid(publicId);

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

      const attendedEvents = await getAttendedEvents(userId, new Date());

      return respond({
        boosts: {
          count: boostItems.length,
          items: boostItems,
        },
        checkIns: {
          count: attendedEvents.length,
          items: attendedEvents,
        },
        publicId,
        createdAt: user.createdAt,
        name: user.name,
        roles: userRoles,
      });
    } catch (error) {
      logError("user.profile.fetch_failed", error);
      return respond({ error: "internal_error" }, { status: 500 });
    }
  });
