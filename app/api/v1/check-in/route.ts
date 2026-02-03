import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import { checkInUser } from "@/lib/data/check-in";
import { logError } from "@/lib/utils/log";
import { decompressUuid } from "@/lib/utils/uuid-compress";

export const POST = withRequestContext(
  withRole(
    "check_in.create",
    USER_ROLES.CREW,
  )(async (request: Request, { auth: _auth }) => {
    try {
      const body = await request.json();
      const { userId, eventId } = body;

      if (!userId || typeof userId !== "string") {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
      }

      if (!eventId || typeof eventId !== "string") {
        return NextResponse.json({ error: "Event ID required" }, { status: 400 });
      }

      const rawUserId = decompressUuid(userId) ?? userId;
      const result = await checkInUser(rawUserId, eventId);

      if (result.alreadyCheckedIn) {
        return NextResponse.json(
          { success: false, alreadyCheckedIn: true, error: "User already checked in" },
          { status: 409 },
        );
      }

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error ?? "Failed to check in user" },
          { status: 500 },
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      logError("check_in.create_request_failed", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }),
);
