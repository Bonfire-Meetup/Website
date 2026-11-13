import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import { listTalkProposals } from "@/lib/data/forms";
import { logError } from "@/lib/utils/log";

/** Lists submitted talk proposals, newest first (up to 1,000). */
export const GET = withRequestContext(
  withRole(
    "admin.talk_proposals",
    USER_ROLES.ADMIN,
  )(async () => {
    try {
      const items = await listTalkProposals();

      return NextResponse.json({ items });
    } catch (error) {
      logError("admin.talk_proposals_failed", error);

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
