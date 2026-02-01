import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getUserRsvpEventIds } from "@/lib/data/rsvps";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

export async function GET(request: Request) {
  return runWithRequestContext(request, async () => {
    const auth = await requireAuth(request, "me.rsvps.read");

    if (!auth.success) {
      return auth.response;
    }

    try {
      const eventIds = await getUserRsvpEventIds(auth.userId);

      return NextResponse.json({ eventIds }, { headers: { "Cache-Control": "no-store" } });
    } catch (error) {
      logError("me.rsvps.get_failed", error, { userId: auth.userId });

      return NextResponse.json({ error: "Failed to load RSVPs" }, { status: 500 });
    }
  });
}
