import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import { db } from "@/lib/data/db";
import { appUser, newsletterSubscription } from "@/lib/data/schema";

export const GET = withRequestContext(
  withRole(
    "newsletter.audience_counts",
    USER_ROLES.EDITOR,
  )(async () => {
    const database = db();

    const [subscriberRows, registeredRows] = await Promise.all([
      database.select({ email: newsletterSubscription.email }).from(newsletterSubscription),
      database
        .select({ email: appUser.email })
        .from(appUser)
        .where(sql`(${appUser.preferences}->>'allowCommunityEmails')::boolean = true`),
    ]);

    const subscriberEmails = new Set(subscriberRows.map((r) => r.email.toLowerCase()));
    const registeredEmails = new Set(registeredRows.map((r) => r.email.toLowerCase()));
    const allEmails = new Set([...subscriberEmails, ...registeredEmails]);

    return NextResponse.json({
      all: allEmails.size,
      subscribers: subscriberEmails.size,
      registered: registeredEmails.size,
    });
  }),
);
