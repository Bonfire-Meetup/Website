import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { getAuthUserId, requireAuth } from "@/lib/api/auth";
import { getClientHashes, isRateLimited } from "@/lib/api/rate-limit";
import { createRsvp, deleteRsvp, getEventRsvps } from "@/lib/data/rsvps";
import { logError, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const RATE_LIMIT_STORE_KEY = "events.rsvps";
const MAX_RSVP_ATTEMPTS = 5;

export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  return runWithRequestContext(request, async () => {
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
}

export async function POST(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  return runWithRequestContext(request, async () => {
    const { eventId } = await params;

    const auth = await requireAuth(request, "events.rsvp.create");

    if (!auth.success) {
      return auth.response;
    }

    const { ipHash } = await getClientHashes();
    const rateLimitKey = `${ipHash}:${auth.userId}`;

    if (isRateLimited(RATE_LIMIT_STORE_KEY, rateLimitKey, MAX_RSVP_ATTEMPTS)) {
      logWarn("events.rsvps.rate_limited", { eventId, userId: auth.userId });

      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

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
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  return runWithRequestContext(request, async () => {
    const { eventId } = await params;

    const auth = await requireAuth(request, "events.rsvp.delete");

    if (!auth.success) {
      return auth.response;
    }

    const { ipHash } = await getClientHashes();
    const rateLimitKey = `${ipHash}:${auth.userId}`;

    if (isRateLimited(RATE_LIMIT_STORE_KEY, rateLimitKey, MAX_RSVP_ATTEMPTS)) {
      logWarn("events.rsvps.rate_limited", { eventId, userId: auth.userId });

      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

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
  });
}
