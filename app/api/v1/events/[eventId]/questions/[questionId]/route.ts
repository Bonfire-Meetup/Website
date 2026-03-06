import { NextResponse } from "next/server";

import { getEventById } from "@/data/events-calendar";
import { withAuth, withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { refundBoost } from "@/lib/data/boosts";
import { deleteOwnEventQuestion, getEventQuestionById } from "@/lib/data/event-questions";
import { getEventQuestionWindow } from "@/lib/events/questions";
import { logError } from "@/lib/utils/log";

const RATE_LIMIT_STORE_KEY = "events.questions.delete";
const MAX_DELETE_ATTEMPTS = 6;

interface RouteParams {
  params: Promise<{ eventId: string; questionId: string }>;
}

export const DELETE = withRequestContext(
  withAuth<RouteParams>("events.questions.delete")(
    withRateLimit<RouteParams & { auth: { userId: string } }>({
      maxHits: MAX_DELETE_ATTEMPTS,
      keyFn: async ({ ctx, ipHash, uaHash }) => {
        const { eventId, questionId } = await ctx.params;
        return `${eventId.trim().toLowerCase()}:${questionId}:${ipHash}:${uaHash}:${ctx.auth.userId}`;
      },
      onLimit: () => NextResponse.json({ error: "rate_limited" }, { status: 429 }),
      storeKey: RATE_LIMIT_STORE_KEY,
    })(async (_request: Request, { params, auth }) => {
      const { eventId, questionId } = await params;
      const event = getEventById(eventId);

      if (!event) {
        return NextResponse.json({ error: "event_not_found" }, { status: 404 });
      }

      const window = getEventQuestionWindow(event);

      if (!window || !window.isOpen) {
        return NextResponse.json({ error: "question_window_closed" }, { status: 400 });
      }

      const question = await getEventQuestionById(questionId);
      if (!question || question.eventId !== eventId.trim().toLowerCase()) {
        return NextResponse.json({ error: "question_not_found" }, { status: 404 });
      }

      try {
        const { deleted, boostUserIds } = await deleteOwnEventQuestion({
          eventId,
          questionId,
          userId: auth.userId,
        });

        if (!deleted) {
          return NextResponse.json({ error: "forbidden" }, { status: 403 });
        }

        await Promise.all(boostUserIds.map((userId) => refundBoost(userId)));

        return NextResponse.json({ success: true });
      } catch (error) {
        logError("events.questions.delete_failed", error, {
          eventId,
          questionId,
          userId: auth.userId,
        });
        return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
      }
    }),
  ),
);
