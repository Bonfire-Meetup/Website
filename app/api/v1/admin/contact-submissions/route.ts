import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import { listContactSubmissions } from "@/lib/data/forms";
import { logError } from "@/lib/utils/log";

/** Lists contact form messages, newest first (up to 1,000). */
export const GET = withRequestContext(
  withRole(
    "admin.contact_submissions",
    USER_ROLES.ADMIN,
  )(async () => {
    try {
      const items = await listContactSubmissions();

      return NextResponse.json({ items });
    } catch (error) {
      logError("admin.contact_submissions_failed", error);

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
