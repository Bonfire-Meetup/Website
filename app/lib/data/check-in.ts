import "server-only";

import { getDatabaseClient } from "@/lib/data/db";
import { logError } from "@/lib/utils/log";

export interface CheckInResult {
  success: boolean;
  alreadyCheckedIn: boolean;
  error?: string;
}

export const checkInUser = async (userId: string, eventId: string): Promise<CheckInResult> => {
  try {
    const sql = getDatabaseClient();

    const existing = (await sql`
        select id from check_in
        where user_id = ${userId} and event_id = ${eventId}
      `) as { id: string }[];

    if (existing.length > 0) {
      return { success: false, alreadyCheckedIn: true };
    }

    await sql`
      insert into check_in (user_id, event_id)
      values (${userId}, ${eventId})
    `;

    return { success: true, alreadyCheckedIn: false };
  } catch (error) {
    logError("data.check_in.failed", error, { userId, eventId });
    return { success: false, alreadyCheckedIn: false, error: "Failed to check in user" };
  }
};

export const isUserCheckedIn = async (userId: string, eventId: string): Promise<boolean> => {
  try {
    const sql = getDatabaseClient();
    const result = (await sql`
        select exists(
          select 1 from check_in
          where user_id = ${userId} and event_id = ${eventId}
        ) as exists
      `) as { exists: boolean }[];

    return result[0]?.exists ?? false;
  } catch (error) {
    logError("data.check_in.check_failed", error, { userId, eventId });
    return false;
  }
};

export const getUserCheckIns = async (
  userId: string,
): Promise<{ eventId: string; createdAt: Date }[]> => {
  try {
    const sql = getDatabaseClient();
    const rows = (await sql`
        select event_id, created_at
        from check_in
        where user_id = ${userId}
        order by created_at desc
      `) as { event_id: string; created_at: Date }[];

    return rows.map((row) => ({
      eventId: row.event_id,
      createdAt: row.created_at,
    }));
  } catch (error) {
    logError("data.check_in.get_user_checkins_failed", error, { userId });
    return [];
  }
};
