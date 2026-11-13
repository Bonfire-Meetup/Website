import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import { listEventSurveyResponses } from "@/lib/data/forms";
import { logError } from "@/lib/utils/log";

/** Lists event feedback survey responses, newest first (up to 1,000). */
export const GET = withRequestContext(
  withRole(
    "admin.survey_responses",
    USER_ROLES.ADMIN,
  )(async () => {
    try {
      const items = await listEventSurveyResponses();

      return NextResponse.json({ items });
    } catch (error) {
      logError("admin.survey_responses_failed", error);

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
