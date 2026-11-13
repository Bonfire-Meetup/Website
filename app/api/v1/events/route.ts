import { NextResponse } from "next/server";

import { allEvents, isEventPast } from "@/data/events-calendar";
import { STATIC_DATA_CACHE_HEADERS } from "@/lib/api/public-cache";

/**
 * Lists Bonfire events in date order, each with its talks and an `isPast` flag.
 *
 * Pass `when=upcoming` or `when=past` to narrow the list; past events come newest first.
 */
export function GET(request: Request) {
  const when = new URL(request.url).searchParams.get("when");
  const now = new Date();
  const events = allEvents.map((event) => ({ ...event, isPast: isEventPast(event, now) }));
  const items =
    when === "upcoming"
      ? events.filter((event) => !event.isPast)
      : when === "past"
        ? events.filter((event) => event.isPast).reverse()
        : events;

  return NextResponse.json({ items }, { headers: STATIC_DATA_CACHE_HEADERS });
}
