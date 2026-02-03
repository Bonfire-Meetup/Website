import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getAuthUserId } from "@/lib/api/auth";
import {
  type AuthContext,
  withAuth,
  withRateLimit,
  withRequestContext,
} from "@/lib/api/route-wrappers";
import { createRsvp, deleteRsvp, getEventRsvps } from "@/lib/data/rsvps";
import { logError, logWarn } from "@/lib/utils/log";

const RATE_LIMIT_STORE_KEY = "events.rsvps";
const MAX_RSVP_ATTEMPTS = 5;

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

export const GET = withRequestContext(async (request: Request, { params }: RouteParams) => {
  const { eventId } = await params;

  let userId: string | null = null;

  try {
    const authResult = await getAuthUserId(request);
    ({ userId } = authResult);

    const result = await getEventRsvps(eventId, 12, userId);

    return NextResponse.json(result);
  } catch (error) {
    logError("events.rsvps.get_failed", error, { eventId, userId });

    return NextResponse.json({ error: "Failed to load RSVPs" }, { status: 500 });
  }
});

export const POST = withRequestContext(
  withAuth<RouteParams>("events.rsvp.create")(
    withRateLimit<RouteParams & AuthContext>({
      maxHits: MAX_RSVP_ATTEMPTS,
      keyFn: ({ ctx, ipHash }) => `${ipHash}:${ctx.auth.userId}`,
      onLimit: async ({ ctx }) => {
        const { eventId } = await ctx.params;
        logWarn("events.rsvps.rate_limited", { eventId, userId: ctx.auth.userId });

        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      },
      storeKey: RATE_LIMIT_STORE_KEY,
    })(async (request: Request, { params, auth }) => {
      const { eventId } = await params;

      try {
        const result = await createRsvp(auth.userId, eventId);

        if (result.alreadyRsvped) {
          return NextResponse.json({ error: "already_rsvped" }, { status: 409 });
        }

        if (!result.success) {
          return NextResponse.json({ error: result.error ?? "Failed to RSVP" }, { status: 500 });
        }

        const normalizedEventId = eventId.trim().toLowerCase();
        revalidateTag(`event-rsvps-${normalizedEventId}`, { expire: 0 });

        return NextResponse.json({ success: true });
      } catch (error) {
        logError("events.rsvps.create_failed", error, { eventId, userId: auth.userId });

        return NextResponse.json({ error: "Failed to create RSVP" }, { status: 500 });
      }
    }),
  ),
);

export const DELETE = withRequestContext(
  withAuth<RouteParams>("events.rsvp.delete")(
    withRateLimit<RouteParams & AuthContext>({
      maxHits: MAX_RSVP_ATTEMPTS,
      keyFn: ({ ctx, ipHash }) => `${ipHash}:${ctx.auth.userId}`,
      onLimit: async ({ ctx }) => {
        const { eventId } = await ctx.params;
        logWarn("events.rsvps.rate_limited", { eventId, userId: ctx.auth.userId });

        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      },
      storeKey: RATE_LIMIT_STORE_KEY,
    })(async (request: Request, { params, auth }) => {
      const { eventId } = await params;

      try {
        const success = await deleteRsvp(auth.userId, eventId);

        if (!success) {
          return NextResponse.json({ error: "Failed to cancel RSVP" }, { status: 500 });
        }

        const normalizedEventId = eventId.trim().toLowerCase();
        revalidateTag(`event-rsvps-${normalizedEventId}`, { expire: 0 });

        return NextResponse.json({ success: true });
      } catch (error) {
        logError("events.rsvps.delete_failed", error, { eventId, userId: auth.userId });

        return NextResponse.json({ error: "Failed to cancel RSVP" }, { status: 500 });
      }
    }),
  ),
);
