import { NextResponse } from "next/server";

import { getEventById } from "@/data/events-calendar";
import { withAuth, withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { videoBoostMutationSchema } from "@/lib/api/schemas";
import { consumeBoost, getUserBoostAllocation, refundBoost } from "@/lib/data/boosts";
import {
  addEventQuestionBoost,
  getEventQuestionBoostStats,
  getEventQuestionById,
  removeEventQuestionBoost,
} from "@/lib/data/event-questions";
import { getEventQuestionWindow } from "@/lib/events/questions";
import { logError } from "@/lib/utils/log";

const RATE_LIMIT_STORE_KEY = "events.question_boosts";
const MAX_WRITE_ATTEMPTS = 8;

interface RouteParams {
  params: Promise<{ eventId: string; questionId: string }>;
}

const validateRequestContext = async (
  eventId: string,
  questionId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> => {
  const event = getEventById(eventId);

  if (!event) {
    return {
      ok: false,
      response: NextResponse.json({ error: "event_not_found" }, { status: 404 }),
    };
  }

  const window = getEventQuestionWindow(event);
  if (!window || !window.isOpen) {
    return {
      ok: false,
      response: NextResponse.json({ error: "question_window_closed" }, { status: 400 }),
    };
  }

  const question = await getEventQuestionById(questionId);
  if (!question || question.eventId !== eventId.trim().toLowerCase()) {
    return {
      ok: false,
      response: NextResponse.json({ error: "question_not_found" }, { status: 404 }),
    };
  }

  return { ok: true };
};

export const POST = withRequestContext(
  withAuth<RouteParams>("events.question_boosts.create")(
    withRateLimit<RouteParams & { auth: { userId: string } }>({
      maxHits: MAX_WRITE_ATTEMPTS,
      keyFn: async ({ ctx, ipHash, uaHash }) => {
        const { eventId, questionId } = await ctx.params;
        return `${eventId.trim().toLowerCase()}:${questionId}:${ipHash}:${uaHash}:${ctx.auth.userId}`;
      },
      onLimit: () => NextResponse.json({ error: "rate_limited" }, { status: 429 }),
      storeKey: RATE_LIMIT_STORE_KEY,
    })(async (_request: Request, { params, auth }) => {
      const { eventId, questionId } = await params;

      const validation = await validateRequestContext(eventId, questionId);
      if (!validation.ok) {
        return validation.response;
      }

      try {
        const existingStats = await getEventQuestionBoostStats(questionId, auth.userId);
        if (existingStats.hasBoosted) {
          const allocation = await getUserBoostAllocation(auth.userId);
          return NextResponse.json(
            {
              added: false,
              availableBoosts: allocation.availableBoosts,
              count: existingStats.count,
            },
            { status: 409 },
          );
        }

        const consumed = await consumeBoost(auth.userId);
        if (!consumed.success) {
          return NextResponse.json(
            {
              availableBoosts: consumed.availableBoosts,
              error: "no_boosts_available",
            },
            { status: 403 },
          );
        }

        const result = await addEventQuestionBoost(questionId, auth.userId);
        let { availableBoosts } = consumed;

        if (!result.added) {
          availableBoosts = await refundBoost(auth.userId);
        }

        const validated = videoBoostMutationSchema.parse({
          ...result,
          availableBoosts,
        });

        return NextResponse.json(validated);
      } catch (error) {
        logError("events.question_boosts.create_failed", error, {
          eventId,
          questionId,
          userId: auth.userId,
        });
        return NextResponse.json({ error: "Failed to boost question" }, { status: 500 });
      }
    }),
  ),
);

export const DELETE = withRequestContext(
  withAuth<RouteParams>("events.question_boosts.delete")(
    withRateLimit<RouteParams & { auth: { userId: string } }>({
      maxHits: MAX_WRITE_ATTEMPTS,
      keyFn: async ({ ctx, ipHash, uaHash }) => {
        const { eventId, questionId } = await ctx.params;
        return `${eventId.trim().toLowerCase()}:${questionId}:${ipHash}:${uaHash}:${ctx.auth.userId}`;
      },
      onLimit: () => NextResponse.json({ error: "rate_limited" }, { status: 429 }),
      storeKey: RATE_LIMIT_STORE_KEY,
    })(async (_request: Request, { params, auth }) => {
      const { eventId, questionId } = await params;

      const validation = await validateRequestContext(eventId, questionId);
      if (!validation.ok) {
        return validation.response;
      }

      try {
        const result = await removeEventQuestionBoost(questionId, auth.userId);
        const availableBoosts = result.removed
          ? await refundBoost(auth.userId)
          : (await getUserBoostAllocation(auth.userId)).availableBoosts;

        const validated = videoBoostMutationSchema.parse({
          ...result,
          availableBoosts,
        });

        return NextResponse.json(validated);
      } catch (error) {
        logError("events.question_boosts.delete_failed", error, {
          eventId,
          questionId,
          userId: auth.userId,
        });
        return NextResponse.json({ error: "Failed to remove question boost" }, { status: 500 });
      }
    }),
  ),
);
