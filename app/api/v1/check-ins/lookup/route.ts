import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { checkInLookupSchema } from "@/lib/api/schemas";
import { USER_ROLES } from "@/lib/config/roles";
import { getAuthUserById } from "@/lib/data/auth";
import { logError } from "@/lib/utils/log";
import { compressUuid, decompressUuid } from "@/lib/utils/uuid-compress";

/** Looks up a ticket holder by their backup ID, for when a QR code can't be scanned. */
export const POST = withRequestContext(
  withRole(
    "check_in.lookup",
    USER_ROLES.CREW,
  )(async (request: Request) => {
    const parsed = checkInLookupSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    try {
      const { publicId } = parsed.data;
      const rawUserId = decompressUuid(publicId) ?? publicId;
      const user = await getAuthUserById(rawUserId);

      if (!user) {
        return NextResponse.json({ error: "user_not_found", valid: false }, { status: 404 });
      }

      return NextResponse.json({
        email: user.email,
        name: user.name,
        publicId: compressUuid(user.id),
        valid: true,
      });
    } catch (error) {
      logError("check_in.lookup_request_failed", error);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
