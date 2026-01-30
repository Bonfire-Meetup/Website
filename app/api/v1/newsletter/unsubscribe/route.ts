import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyUnsubscribeToken } from "@/lib/auth/jwt";
import { db } from "@/lib/data/db";
import { appUser, newsletterSubscription } from "@/lib/data/schema";
import { logError, logInfo } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const unsubscribeSchema = z.object({
  token: z.string().min(1),
});

export const POST = (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const result = unsubscribeSchema.safeParse(payload);
    if (!result.success) {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const { token } = result.data;

    let email: string;
    try {
      email = await verifyUnsubscribeToken(token);
    } catch {
      return respond({ error: "invalid_token" }, { status: 400 });
    }

    try {
      const database = db();
      const results = { newsletter: false, account: false };

      const newsletterSub = await database.query.newsletterSubscription.findFirst({
        where: eq(newsletterSubscription.email, email),
      });

      if (newsletterSub) {
        await database
          .delete(newsletterSubscription)
          .where(eq(newsletterSubscription.email, email));
        results.newsletter = true;
      }

      const user = await database.query.appUser.findFirst({
        where: eq(appUser.email, email),
      });

      if (user) {
        const prefs = user.preferences as { allowCommunityEmails?: boolean } | null;
        if (prefs?.allowCommunityEmails) {
          await database
            .update(appUser)
            .set({
              preferences: sql`jsonb_set(coalesce(${appUser.preferences}, '{}'::jsonb), '{allowCommunityEmails}', 'false'::jsonb)`,
            })
            .where(eq(appUser.id, user.id));
          results.account = true;
        }
      }

      if (!results.newsletter && !results.account) {
        return respond({ error: "not_subscribed" }, { status: 400 });
      }

      logInfo("newsletter.unsubscribed", { email, results });

      return respond({
        ok: true,
        email,
        unsubscribedFrom:
          results.newsletter && results.account
            ? "both"
            : results.newsletter
              ? "newsletter"
              : "account",
      });
    } catch (error) {
      logError("newsletter.unsubscribe_failed", error, { email });

      return respond({ error: "unsubscribe_failed" }, { status: 500 });
    }
  });
