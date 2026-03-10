import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import { getAuthUserById } from "@/lib/data/auth";
import { logError } from "@/lib/utils/log";
import { compressUuid, decompressUuid } from "@/lib/utils/uuid-compress";

export const POST = withRequestContext(
  withRole(
    "check_in.lookup",
    USER_ROLES.CREW,
  )(async (request: Request) => {
    try {
      const body = await request.json();
      const { publicId } = body;

      if (!publicId || typeof publicId !== "string") {
        return NextResponse.json({ error: "Public ID required" }, { status: 400 });
      }

      const rawUserId = decompressUuid(publicId) ?? publicId;
      const user = await getAuthUserById(rawUserId);

      if (!user) {
        return NextResponse.json({ valid: false, error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        email: user.email,
        name: user.name,
        publicId: compressUuid(user.id),
        valid: true,
      });
    } catch (error) {
      logError("check_in.lookup_request_failed", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }),
);
