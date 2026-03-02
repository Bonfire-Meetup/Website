import { type NextRequest, NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import { getNewsletterArchiveList, toArchiveListItem } from "@/lib/data/newsletter-archive";

export const GET = withRequestContext(
  withRole(
    "newsletter.archive",
    USER_ROLES.EDITOR,
  )(async (request: NextRequest) => {
    const testSend = request.nextUrl.searchParams.get("testSend") === "true";

    const records = await getNewsletterArchiveList(100, 0);
    const filtered = records.filter((r) => r.testSend === testSend).map(toArchiveListItem);

    return NextResponse.json(filtered);
  }),
);
