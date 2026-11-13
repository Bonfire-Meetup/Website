import { NextResponse } from "next/server";

import { STATIC_DATA_CACHE_HEADERS } from "@/lib/api/public-cache";
import { getSpeakerProfile } from "@/lib/events/speaker-profiles";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * Returns a speaker's profile and every talk they gave, newest first.
 *
 * `slug` is the speaker page's URL segment; only its trailing id matters.
 */
export async function GET(_request: Request, { params }: RouteParams) {
  const speaker = getSpeakerProfile((await params).slug);

  if (!speaker) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json(speaker, { headers: STATIC_DATA_CACHE_HEADERS });
}
