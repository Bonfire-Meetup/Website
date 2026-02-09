import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";
import { db } from "@/lib/data/db";
import { appUser, eventRsvp } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";
import { compressUuid } from "@/lib/utils/uuid-compress";

export interface RsvpResult {
  success: boolean;
  alreadyRsvped: boolean;
  error?: string;
}

const normalizeEventId = (eventId: string): string => eventId.trim().toLowerCase();

export const createRsvp = async (userId: string, eventId: string): Promise<RsvpResult> => {
  const normalized = normalizeEventId(eventId);
  try {
    const existing = await db()
      .select({ id: eventRsvp.id })
      .from(eventRsvp)
      .where(and(eq(eventRsvp.userId, userId), eq(eventRsvp.eventId, normalized)));

    if (existing.length > 0) {
      return { success: false, alreadyRsvped: true };
    }

    await db().insert(eventRsvp).values({ userId, eventId: normalized });

    return { success: true, alreadyRsvped: false };
  } catch (error) {
    logError("data.rsvp.create_failed", error, { userId, eventId });
    return { success: false, alreadyRsvped: false, error: "Failed to create RSVP" };
  }
};

export const deleteRsvp = async (userId: string, eventId: string): Promise<boolean> => {
  const normalized = normalizeEventId(eventId);
  try {
    await db()
      .delete(eventRsvp)
      .where(and(eq(eventRsvp.userId, userId), eq(eventRsvp.eventId, normalized)));

    return true;
  } catch (error) {
    logError("data.rsvp.delete_failed", error, { userId, eventId });
    return false;
  }
};

export const isUserRsvped = async (userId: string, eventId: string): Promise<boolean> => {
  const normalized = normalizeEventId(eventId);
  try {
    const result = await db()
      .select({ exists: sql<boolean>`true` })
      .from(eventRsvp)
      .where(and(eq(eventRsvp.userId, userId), eq(eventRsvp.eventId, normalized)))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    logError("data.rsvp.check_failed", error, { userId, eventId });
    return false;
  }
};

export interface PublicRsvpUser {
  publicId: string;
  name: string | null;
}

export interface EventRsvpsBaseData {
  totalCount: number;
  publicUsers: PublicRsvpUser[];
  privateCount: number;
  hasMore: boolean;
}

export interface EventRsvpsResult extends EventRsvpsBaseData {
  hasRsvped: boolean;
}

const getEventRsvpsBase = async (eventId: string, limit = 12): Promise<EventRsvpsBaseData> => {
  "use cache";
  const normalizedEventId = normalizeEventId(eventId);
  cacheTag(`event-rsvps-${normalizedEventId}`);
  cacheLife({ revalidate: CACHE_LIFETIMES.EVENT_RSVPS });
  try {
    const countResult = await db()
      .select({ count: sql<number>`count(*)::int` })
      .from(eventRsvp)
      .where(sql`LOWER(${eventRsvp.eventId}) = ${normalizedEventId}`);

    const totalCount = countResult[0]?.count ?? 0;

    const rows = await db()
      .select({
        id: appUser.id,
        name: appUser.name,
        preferences: appUser.preferences,
      })
      .from(eventRsvp)
      .innerJoin(appUser, eq(eventRsvp.userId, appUser.id))
      .where(sql`LOWER(${eventRsvp.eventId}) = ${normalizedEventId}`)
      .orderBy(sql`${eventRsvp.createdAt} DESC`)
      .limit(limit);

    const publicUsers: PublicRsvpUser[] = [];
    let privateCount = 0;

    for (const row of rows) {
      const prefs = (row.preferences || {}) as Record<string, unknown>;
      const isPublic = typeof prefs.publicProfile === "boolean" ? prefs.publicProfile : false;

      if (isPublic) {
        publicUsers.push({
          publicId: compressUuid(row.id),
          name: row.name,
        });
      } else {
        privateCount++;
      }
    }

    return {
      totalCount,
      publicUsers,
      privateCount,
      hasMore: totalCount > rows.length,
    };
  } catch (error) {
    logError("data.rsvp.get_event_rsvps_failed", error, { eventId });
    return { totalCount: 0, publicUsers: [], privateCount: 0, hasMore: false };
  }
};

export const getUserRsvps = async (
  userId: string,
): Promise<{ eventId: string; createdAt: string }[]> => {
  try {
    const rows = await db()
      .select({
        eventId: eventRsvp.eventId,
        createdAt: eventRsvp.createdAt,
      })
      .from(eventRsvp)
      .where(eq(eventRsvp.userId, userId))
      .orderBy(sql`${eventRsvp.createdAt} DESC`);

    return rows.map((row) => ({
      eventId: row.eventId,
      createdAt: row.createdAt.toISOString(),
    }));
  } catch (error) {
    logError("data.rsvp.get_user_rsvps_failed", error, { userId });
    return [];
  }
};

export const getEventRsvps = async (
  eventId: string,
  limit = 12,
  userId: string | null = null,
): Promise<EventRsvpsResult> => {
  const normalizedEventId = normalizeEventId(eventId);
  const baseData = await getEventRsvpsBase(eventId, limit);

  let hasRsvped = false;
  if (userId) {
    try {
      const userRsvpCheck = await db()
        .select({ id: eventRsvp.id })
        .from(eventRsvp)
        .where(
          and(
            eq(eventRsvp.userId, userId),
            sql`LOWER(${eventRsvp.eventId}) = ${normalizedEventId}`,
          ),
        )
        .limit(1);
      hasRsvped = userRsvpCheck.length > 0;
    } catch (error) {
      logError("data.rsvp.check_user_rsvp_failed", error, { eventId, userId });
    }
  }

  return {
    ...baseData,
    hasRsvped,
  };
};
