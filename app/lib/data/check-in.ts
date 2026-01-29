import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/data/db";
import { checkIn } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";

export interface CheckInResult {
  success: boolean;
  alreadyCheckedIn: boolean;
  error?: string;
}

export const checkInUser = async (userId: string, eventId: string): Promise<CheckInResult> => {
  try {
    const existing = await db()
      .select({ id: checkIn.id })
      .from(checkIn)
      .where(and(eq(checkIn.userId, userId), eq(checkIn.eventId, eventId)));

    if (existing.length > 0) {
      return { success: false, alreadyCheckedIn: true };
    }

    await db().insert(checkIn).values({ userId, eventId });

    return { success: true, alreadyCheckedIn: false };
  } catch (error) {
    logError("data.check_in.failed", error, { userId, eventId });
    return { success: false, alreadyCheckedIn: false, error: "Failed to check in user" };
  }
};

export const isUserCheckedIn = async (userId: string, eventId: string): Promise<boolean> => {
  try {
    const result = await db()
      .select({ exists: sql<boolean>`true` })
      .from(checkIn)
      .where(and(eq(checkIn.userId, userId), eq(checkIn.eventId, eventId)))
      .limit(1);

    return result.length > 0;
  } catch (error) {
    logError("data.check_in.check_failed", error, { userId, eventId });
    return false;
  }
};

export const getUserCheckIns = async (
  userId: string,
): Promise<{ eventId: string; createdAt: Date }[]> => {
  try {
    const rows = await db()
      .select({
        eventId: checkIn.eventId,
        createdAt: checkIn.createdAt,
      })
      .from(checkIn)
      .where(eq(checkIn.userId, userId))
      .orderBy(sql`${checkIn.createdAt} DESC`);

    return rows;
  } catch (error) {
    logError("data.check_in.get_user_checkins_failed", error, { userId });
    return [];
  }
};
