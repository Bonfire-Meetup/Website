import "server-only";

import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

import { allEvents, isEventPast, isTbaDate } from "@/data/events-calendar";
import {
  QUESTION_ACTIVITY_RECENT_EVENT_LIMIT,
  resolveQuestionActivityLevel,
  type QuestionActivityLevel,
} from "@/lib/config/question-activity";
import { db } from "@/lib/data/db";
import { appUser, eventQuestion, eventQuestionBoost } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";
import { compressUuid } from "@/lib/utils/uuid-compress";

export interface EventQuestionRow {
  authorName: string | null;
  authorPublicId: string | null;
  authorIsPublic: boolean;
  authorMembershipTier: number | null;
  id: string;
  text: string;
  talkIndex: number | null;
  createdAt: string;
  boostCount: number;
  hasBoosted: boolean;
  isOwn: boolean;
}

export interface EventQuestionBoostMutationResult {
  count: number;
  added?: boolean;
  removed?: boolean;
}

const normalizeEventId = (eventId: string): string => eventId.trim().toLowerCase();

const getRecentCompletedEventIds = () => {
  const now = new Date();

  return allEvents
    .filter((event) => !isTbaDate(event.date) && isEventPast(event, now))
    .map((event) => normalizeEventId(event.id))
    .reverse()
    .slice(0, QUESTION_ACTIVITY_RECENT_EVENT_LIMIT);
};

const getQuestionActivityLevelsByUserId = async (userIds: string[]) => {
  const distinctUserIds = [...new Set(userIds.filter((userId) => userId.length > 0))];
  const recentEventIds = getRecentCompletedEventIds();

  if (distinctUserIds.length === 0 || recentEventIds.length === 0) {
    return new Map<string, QuestionActivityLevel | null>();
  }

  const rows = await db()
    .select({
      eventId: eventQuestion.eventId,
      userId: eventQuestion.userId,
    })
    .from(eventQuestion)
    .where(
      and(
        inArray(eventQuestion.userId, distinctUserIds),
        inArray(eventQuestion.eventId, recentEventIds),
      ),
    )
    .groupBy(eventQuestion.userId, eventQuestion.eventId);

  const participatedEventIdsByUserId = new Map<string, Set<string>>();

  for (const row of rows) {
    const normalizedEventId = normalizeEventId(row.eventId);
    const eventIds = participatedEventIdsByUserId.get(row.userId) ?? new Set<string>();
    eventIds.add(normalizedEventId);
    participatedEventIdsByUserId.set(row.userId, eventIds);
  }

  return new Map(
    distinctUserIds.map((userId) => [
      userId,
      resolveQuestionActivityLevel(
        recentEventIds,
        participatedEventIdsByUserId.get(userId) ?? new Set<string>(),
      ),
    ]),
  );
};

const toBooleanValue = (value: unknown): boolean =>
  value === true || value === "true" || value === "t" || value === 1 || value === "1";

const parseUuidArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string" || value === "{}") {
    return [];
  }

  return value
    .slice(1, -1)
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export const getEventQuestions = async (
  eventId: string,
  userId: string | null = null,
): Promise<EventQuestionRow[]> => {
  const normalizedEventId = normalizeEventId(eventId);

  try {
    const questions = await db()
      .select({
        createdAt: eventQuestion.createdAt,
        id: eventQuestion.id,
        talkIndex: eventQuestion.talkIndex,
        text: eventQuestion.text,
        userId: eventQuestion.userId,
        userName: appUser.name,
        userMembershipTier: appUser.membershipTier,
        userPreferences: appUser.preferences,
      })
      .from(eventQuestion)
      .innerJoin(appUser, eq(eventQuestion.userId, appUser.id))
      .where(eq(eventQuestion.eventId, normalizedEventId))
      .orderBy(desc(eventQuestion.createdAt));

    if (questions.length === 0) {
      return [];
    }

    const questionIds = questions.map((row) => row.id);

    const boostCounts = await db()
      .select({
        count: count(),
        questionId: eventQuestionBoost.questionId,
      })
      .from(eventQuestionBoost)
      .where(inArray(eventQuestionBoost.questionId, questionIds))
      .groupBy(eventQuestionBoost.questionId);

    const boostCountByQuestionId = new Map(boostCounts.map((row) => [row.questionId, row.count]));

    const boostedByUser = new Set<string>();
    if (userId) {
      const userRows = await db()
        .select({
          questionId: eventQuestionBoost.questionId,
        })
        .from(eventQuestionBoost)
        .where(
          and(
            eq(eventQuestionBoost.userId, userId),
            inArray(eventQuestionBoost.questionId, questionIds),
          ),
        );

      for (const row of userRows) {
        boostedByUser.add(row.questionId);
      }
    }

    return questions
      .map((row) => {
        const prefs = (row.userPreferences ?? {}) as Record<string, unknown>;
        const authorIsPublic =
          typeof prefs.publicProfile === "boolean" ? prefs.publicProfile : false;

        return {
          authorIsPublic,
          authorMembershipTier: authorIsPublic ? (row.userMembershipTier ?? null) : null,
          authorName: authorIsPublic ? row.userName : null,
          authorPublicId: authorIsPublic ? compressUuid(row.userId) : null,
          boostCount: boostCountByQuestionId.get(row.id) ?? 0,
          createdAt: row.createdAt.toISOString(),
          hasBoosted: boostedByUser.has(row.id),
          id: row.id,
          isOwn: userId === row.userId,
          talkIndex: row.talkIndex,
          text: row.text,
        };
      })
      .sort((a, b) => {
        if (b.boostCount !== a.boostCount) {
          return b.boostCount - a.boostCount;
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  } catch (error) {
    logError("data.event_questions.list_failed", error, { eventId: normalizedEventId, userId });
    throw error;
  }
};

export const createEventQuestion = async ({
  eventId,
  talkIndex,
  text,
  userId,
}: {
  eventId: string;
  talkIndex: number | null;
  text: string;
  userId: string;
}): Promise<void> => {
  const normalizedEventId = normalizeEventId(eventId);

  try {
    await db().insert(eventQuestion).values({
      eventId: normalizedEventId,
      talkIndex,
      text,
      userId,
    });
  } catch (error) {
    logError("data.event_questions.create_failed", error, {
      eventId: normalizedEventId,
      userId,
    });
    throw error;
  }
};

export const getUserQuestionActivityLevel = async (
  userId: string,
): Promise<QuestionActivityLevel | null> => {
  try {
    return (await getQuestionActivityLevelsByUserId([userId])).get(userId) ?? null;
  } catch (error) {
    logError("data.event_questions.user_activity_failed", error, { userId });
    throw error;
  }
};

export const deleteOwnEventQuestion = async ({
  eventId,
  questionId,
  userId,
}: {
  eventId: string;
  questionId: string;
  userId: string;
}): Promise<{ deleted: boolean; boostUserIds: string[] }> => {
  const normalizedEventId = normalizeEventId(eventId);

  try {
    const result = await db().execute(sql`
      WITH target_question AS (
        SELECT ${eventQuestion.id} AS id
        FROM ${eventQuestion}
        WHERE ${eventQuestion.id} = ${questionId}
          AND ${eventQuestion.userId} = ${userId}
          AND ${eventQuestion.eventId} = ${normalizedEventId}
      ),
      removed_boosts AS (
        DELETE FROM ${eventQuestionBoost}
        WHERE ${eventQuestionBoost.questionId} IN (SELECT id FROM target_question)
        RETURNING ${eventQuestionBoost.userId} AS user_id
      ),
      deleted_question AS (
        DELETE FROM ${eventQuestion}
        WHERE ${eventQuestion.id} IN (SELECT id FROM target_question)
        RETURNING ${eventQuestion.id} AS id
      )
      SELECT
        EXISTS (SELECT 1 FROM deleted_question) AS deleted,
        COALESCE(
          array_agg(DISTINCT removed_boosts.user_id) FILTER (
            WHERE removed_boosts.user_id IS NOT NULL
          ),
          ARRAY[]::uuid[]
        ) AS boost_user_ids
      FROM removed_boosts
    `);

    const row = result.rows[0] as
      | { boost_user_ids?: string[] | string | null; deleted?: boolean | string | number }
      | undefined;

    return {
      boostUserIds: parseUuidArray(row?.boost_user_ids),
      deleted: toBooleanValue(row?.deleted),
    };
  } catch (error) {
    logError("data.event_questions.delete_failed", error, {
      eventId: normalizedEventId,
      questionId,
      userId,
    });
    throw error;
  }
};

export const deleteAllEventQuestionsByUser = async (
  userId: string,
): Promise<{ boostUserIds: string[] }> => {
  try {
    const result = await db().execute(sql`
      WITH target_questions AS (
        SELECT ${eventQuestion.id} AS id
        FROM ${eventQuestion}
        WHERE ${eventQuestion.userId} = ${userId}
      ),
      removed_boosts AS (
        DELETE FROM ${eventQuestionBoost}
        WHERE ${eventQuestionBoost.questionId} IN (SELECT id FROM target_questions)
        RETURNING ${eventQuestionBoost.userId} AS user_id
      ),
      deleted_questions AS (
        DELETE FROM ${eventQuestion}
        WHERE ${eventQuestion.id} IN (SELECT id FROM target_questions)
        RETURNING ${eventQuestion.id} AS id
      )
      SELECT
        COALESCE(
          array_agg(DISTINCT removed_boosts.user_id) FILTER (
            WHERE removed_boosts.user_id IS NOT NULL
          ),
          ARRAY[]::uuid[]
        ) AS boost_user_ids
      FROM removed_boosts
    `);

    const row = result.rows[0] as { boost_user_ids?: string[] | string | null } | undefined;

    return {
      boostUserIds: parseUuidArray(row?.boost_user_ids),
    };
  } catch (error) {
    logError("data.event_questions.delete_all_by_user_failed", error, { userId });
    throw error;
  }
};

export const getEventQuestionById = async (
  questionId: string,
): Promise<{ eventId: string; id: string } | null> => {
  try {
    const rows = await db()
      .select({
        eventId: eventQuestion.eventId,
        id: eventQuestion.id,
      })
      .from(eventQuestion)
      .where(eq(eventQuestion.id, questionId))
      .limit(1);

    return rows[0] ?? null;
  } catch (error) {
    logError("data.event_questions.get_by_id_failed", error, { questionId });
    throw error;
  }
};

export const getEventQuestionBoostStats = async (
  questionId: string,
  userId?: string | null,
): Promise<{ count: number; hasBoosted: boolean }> => {
  try {
    const countRows = await db()
      .select({ count: count() })
      .from(eventQuestionBoost)
      .where(eq(eventQuestionBoost.questionId, questionId));

    const boostCount = countRows[0]?.count ?? 0;

    if (!userId) {
      return { count: boostCount, hasBoosted: false };
    }

    const boostedRows = await db()
      .select({
        exists: sql<boolean>`true`,
      })
      .from(eventQuestionBoost)
      .where(
        and(eq(eventQuestionBoost.questionId, questionId), eq(eventQuestionBoost.userId, userId)),
      )
      .limit(1);

    return { count: boostCount, hasBoosted: boostedRows.length > 0 };
  } catch (error) {
    logError("data.event_questions.boost_stats_failed", error, { questionId, userId });
    throw error;
  }
};

export const addEventQuestionBoost = async (
  questionId: string,
  userId: string,
): Promise<EventQuestionBoostMutationResult> => {
  try {
    const inserted = await db()
      .insert(eventQuestionBoost)
      .values({ questionId, userId })
      .onConflictDoNothing({
        target: [eventQuestionBoost.questionId, eventQuestionBoost.userId],
      })
      .returning({ id: eventQuestionBoost.id });

    const countRows = await db()
      .select({ count: count() })
      .from(eventQuestionBoost)
      .where(eq(eventQuestionBoost.questionId, questionId));

    return { added: inserted.length > 0, count: countRows[0]?.count ?? 0 };
  } catch (error) {
    logError("data.event_questions.boost_add_failed", error, { questionId, userId });
    throw error;
  }
};

export const removeEventQuestionBoost = async (
  questionId: string,
  userId: string,
): Promise<EventQuestionBoostMutationResult> => {
  try {
    const removed = await db()
      .delete(eventQuestionBoost)
      .where(
        and(eq(eventQuestionBoost.questionId, questionId), eq(eventQuestionBoost.userId, userId)),
      )
      .returning({ id: eventQuestionBoost.id });

    const countRows = await db()
      .select({ count: count() })
      .from(eventQuestionBoost)
      .where(eq(eventQuestionBoost.questionId, questionId));

    return { count: countRows[0]?.count ?? 0, removed: removed.length > 0 };
  } catch (error) {
    logError("data.event_questions.boost_remove_failed", error, { questionId, userId });
    throw error;
  }
};

export const getEventQuestionBoostUserIds = async (questionId: string): Promise<string[]> => {
  try {
    const rows = await db()
      .select({
        userId: eventQuestionBoost.userId,
      })
      .from(eventQuestionBoost)
      .where(eq(eventQuestionBoost.questionId, questionId));

    return rows.map((row) => row.userId);
  } catch (error) {
    logError("data.event_questions.boost_users_failed", error, { questionId });
    throw error;
  }
};
