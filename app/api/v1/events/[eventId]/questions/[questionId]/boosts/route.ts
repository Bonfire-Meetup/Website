import { NextResponse } from "next/server";

import { getEventById } from "@/data/events-calendar";
import { withAuth, withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { videoBoostMutationSchema } from "@/lib/api/schemas";
import {
  createEventQuestionBoostOperation,
  removeEventQuestionBoostOperation,
} from "@/lib/data/boost-operations";
import { getEventQuestionById } from "@/lib/data/event-questions";
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
): Promise<
  | {
      ok: true;
      question: NonNullable<Awaited<ReturnType<typeof getEventQuestionById>>>;
    }
  | { ok: false; response: NextResponse }
> => {
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

  return { ok: true, question };
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
        const result = await createEventQuestionBoostOperation(auth.userId, {
          eventId,
          questionId,
        });
        if (result.error === "no_boosts_available") {
          return NextResponse.json(
            {
              availableBoosts: result.availableBoosts,
              error: "no_boosts_available",
            },
            { status: 403 },
          );
        }
        const validated = videoBoostMutationSchema.parse(result);

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
        const result = await removeEventQuestionBoostOperation(auth.userId, {
          eventId,
          questionId,
        });
        const validated = videoBoostMutationSchema.parse(result);

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
