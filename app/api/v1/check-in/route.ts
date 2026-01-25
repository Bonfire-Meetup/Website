import { NextResponse, type NextRequest } from "next/server";

import { requireRole } from "@/lib/api/auth";
import { USER_ROLES } from "@/lib/config/roles";
import { checkInUser } from "@/lib/data/check-in";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

export async function POST(request: NextRequest) {
  return runWithRequestContext(request, async () => {
    const auth = await requireRole(request, "check_in.create", USER_ROLES.CREW);

    if (!auth.success) {
      return auth.response;
    }

    try {
      const body = await request.json();
      const { userId, eventId } = body;

      if (!userId || typeof userId !== "string") {
        return NextResponse.json({ error: "User ID required" }, { status: 400 });
      }

      if (!eventId || typeof eventId !== "string") {
        return NextResponse.json({ error: "Event ID required" }, { status: 400 });
      }

      const result = await checkInUser(userId, eventId);

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
  });
}
