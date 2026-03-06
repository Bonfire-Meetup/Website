import { NextResponse } from "next/server";

import { getEventById } from "@/data/events-calendar";
import { getAuthUserId } from "@/lib/api/auth";
import {
  type AuthContext,
  withAuth,
  withRateLimit,
  withRequestContext,
} from "@/lib/api/route-wrappers";
import { eventQuestionCreateSchema } from "@/lib/api/schemas";
import { getUserBoostAllocation } from "@/lib/data/boosts";
import { createEventQuestion, getEventQuestions } from "@/lib/data/event-questions";
import { getEventQuestionWindow } from "@/lib/events/questions";
import { logError } from "@/lib/utils/log";
import { containsProfanity } from "@/lib/utils/profanity-filter";
import { sanitizeUserText } from "@/lib/utils/text";

const READ_RATE_LIMIT_STORE_KEY = "events.questions.read";
const WRITE_RATE_LIMIT_STORE_KEY = "events.questions.write";
const MAX_READ_ATTEMPTS = 40;
const MAX_WRITE_ATTEMPTS = 4;

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

const normalizeTalkIndex = (talkIndex: number | null | undefined): number | null =>
  talkIndex ?? null;

const isValidTalkIndex = (talkIndex: number | null, talkCount: number): boolean =>
  talkIndex === null || (talkIndex >= 0 && talkIndex < talkCount);

export const GET = withRequestContext(
  withRateLimit<RouteParams>({
    maxHits: MAX_READ_ATTEMPTS,
    keyFn: async ({ ctx, ipHash, uaHash, request }) => {
      const authResult = await getAuthUserId(request);
      const { eventId } = await ctx.params;
      const identifier =
        authResult.status === "valid" && authResult.userId
          ? authResult.userId
          : `${ipHash}:${uaHash}`;

      return `${eventId.trim().toLowerCase()}:${identifier}`;
    },
    onLimit: () => NextResponse.json({ error: "rate_limited" }, { status: 429 }),
    storeKey: READ_RATE_LIMIT_STORE_KEY,
  })(async (request: Request, { params }: RouteParams) => {
    const { eventId } = await params;
    const event = getEventById(eventId);

    if (!event) {
      return NextResponse.json({ error: "event_not_found" }, { status: 404 });
    }

    const window = getEventQuestionWindow(event);

    if (!window) {
      return NextResponse.json({
        availableBoosts: null,
        canParticipate: false,
        closesAt: null,
        isAuthenticated: false,
        isWindowOpen: false,
        items: [],
        opensAt: null,
      });
    }

    const authResult = await getAuthUserId(request);
    const userId = authResult.status === "valid" ? authResult.userId : null;

    try {
      const [items, availableBoosts] = await Promise.all([
        getEventQuestions(eventId, userId),
        userId
          ? getUserBoostAllocation(userId).then((allocation) => allocation.availableBoosts)
          : Promise.resolve(null),
      ]);

      return NextResponse.json({
        availableBoosts,
        canParticipate: Boolean(userId && window.isOpen),
        closesAt: window.closesAt,
        isAuthenticated: Boolean(userId),
        isWindowOpen: window.isOpen,
        items,
        opensAt: window.opensAt,
      });
    } catch (error) {
      logError("events.questions.get_failed", error, { eventId, userId });
      return NextResponse.json({ error: "Failed to load questions" }, { status: 500 });
    }
  }),
);

export const POST = withRequestContext(
  withAuth<RouteParams>("events.questions.create")(
    withRateLimit<RouteParams & AuthContext>({
      maxHits: MAX_WRITE_ATTEMPTS,
      keyFn: async ({ ctx, ipHash, uaHash }) => {
        const { eventId } = await ctx.params;
        return `${eventId.trim().toLowerCase()}:${ipHash}:${uaHash}:${ctx.auth.userId}`;
      },
      onLimit: () => NextResponse.json({ error: "rate_limited" }, { status: 429 }),
      storeKey: WRITE_RATE_LIMIT_STORE_KEY,
    })(async (request: Request, { params, auth }) => {
      const { eventId } = await params;
      const event = getEventById(eventId);

      if (!event) {
        return NextResponse.json({ error: "event_not_found" }, { status: 404 });
      }

      const window = getEventQuestionWindow(event);

      if (!window || !window.isOpen) {
        return NextResponse.json({ error: "question_window_closed" }, { status: 400 });
      }

      try {
        const body = (await request.json().catch(() => ({}))) as unknown;
        const parsed = eventQuestionCreateSchema.safeParse(body);

        if (!parsed.success) {
          return NextResponse.json({ error: "invalid_body" }, { status: 400 });
        }

        const text = sanitizeUserText(parsed.data.text);
        const talkIndex = normalizeTalkIndex(parsed.data.talkIndex);

        if (text.length < 3 || text.length > 600) {
          return NextResponse.json({ error: "invalid_body" }, { status: 400 });
        }

        if (!isValidTalkIndex(talkIndex, event.speakers.length)) {
          return NextResponse.json({ error: "invalid_talk_index" }, { status: 400 });
        }

        const locale = parsed.data.locale ?? "en";

        if (containsProfanity(text, locale)) {
          return NextResponse.json({ error: "profanity_not_allowed" }, { status: 400 });
        }

        await createEventQuestion({
          eventId,
          talkIndex,
          text,
          userId: auth.userId,
        });

        return NextResponse.json({ success: true });
      } catch (error) {
        logError("events.questions.create_failed", error, { eventId, userId: auth.userId });
        return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
      }
    }),
  ),
);
