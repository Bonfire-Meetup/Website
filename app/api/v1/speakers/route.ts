import { NextResponse } from "next/server";

import { STATIC_DATA_CACHE_HEADERS } from "@/lib/api/public-cache";
import { getAllSpeakerProfiles } from "@/lib/events/speaker-profiles";

/** Lists everyone who has spoken at Bonfire, with their number of talks. */
export function GET() {
  const items = getAllSpeakerProfiles()
    .map(({ talks, members: _members, ...speaker }) => ({ ...speaker, talkCount: talks.length }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return NextResponse.json({ items }, { headers: STATIC_DATA_CACHE_HEADERS });
}
