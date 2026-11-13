import { NextResponse } from "next/server";

import { getEventById, isEventPast } from "@/data/events-calendar";
import { STATIC_DATA_CACHE_HEADERS } from "@/lib/api/public-cache";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}

/** Returns one event: venue, date, time, links and its talks with speakers. */
export async function GET(_request: Request, { params }: RouteParams) {
  const event = getEventById((await params).eventId);

  if (!event) {
    return NextResponse.json({ error: "event_not_found" }, { status: 404 });
  }

  return NextResponse.json(
    { ...event, isPast: isEventPast(event, new Date()) },
    { headers: STATIC_DATA_CACHE_HEADERS },
  );
}
