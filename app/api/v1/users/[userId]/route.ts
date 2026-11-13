import { NextResponse } from "next/server";

import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { getPublicProfile } from "@/lib/data/public-profile";
import { logError } from "@/lib/utils/log";
import { decompressUuid } from "@/lib/utils/uuid-compress";

/**
 * Returns a user's public profile: name, public roles, membership, activity stats, boosted
 * videos, attended events and upcoming RSVPs. Private profiles return 403.
 */
interface RouteParams {
  params: Promise<{ userId: string }>;
}

export const GET = withRequestContext(
  withRateLimit<RouteParams>({ maxHits: 60, storeKey: "public-profile" })(
    async (_request: Request, { params }: RouteParams) => {
      const userId = decompressUuid((await params).userId);

      if (!userId) {
        return NextResponse.json({ error: "invalid_id" }, { status: 400 });
      }

      try {
        const result = await getPublicProfile(userId);

        if (result.status === "not_found") {
          return NextResponse.json({ error: "not_found" }, { status: 404 });
        }

        if (result.status === "private") {
          return NextResponse.json({ error: "private_profile" }, { status: 403 });
        }

        return NextResponse.json(result.profile);
      } catch (error) {
        logError("user.profile.fetch_failed", error);
        return NextResponse.json({ error: "internal_error" }, { status: 500 });
      }
    },
  ),
);
