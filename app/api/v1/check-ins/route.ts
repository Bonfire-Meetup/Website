import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { checkInCreateSchema } from "@/lib/api/schemas";
import { USER_ROLES } from "@/lib/config/roles";
import { checkInUser } from "@/lib/data/check-in";
import { logError } from "@/lib/utils/log";
import { decompressUuid } from "@/lib/utils/uuid-compress";

/** Checks a ticket holder in to an event. Used by the crew QR reader. */
export const POST = withRequestContext(
  withRole(
    "check_in.create",
    USER_ROLES.CREW,
  )(async (request: Request) => {
    const parsed = checkInCreateSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    try {
      const { eventId, userId } = parsed.data;
      const rawUserId = decompressUuid(userId) ?? userId;
      const result = await checkInUser(rawUserId, eventId);

      if (result.alreadyCheckedIn) {
        return NextResponse.json(
          { alreadyCheckedIn: true, error: "already_checked_in" },
          { status: 409 },
        );
      }

      if (!result.success) {
        return NextResponse.json({ error: "check_in_failed" }, { status: 500 });
      }

      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      logError("check_in.create_request_failed", error);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
