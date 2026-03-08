import { checkBotId } from "botid/server";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getClientHashes, isOriginAllowed } from "@/lib/api/rate-limit";
import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import {
  newsletterSubscribeRequestSchema,
  newsletterSubscribeResponseSchema,
} from "@/lib/api/schemas";
import { verifyUnsubscribeToken } from "@/lib/auth/jwt";
import { db } from "@/lib/data/db";
import { subscribeToNewsletter } from "@/lib/data/newsletter";
import { appUser, newsletterSubscription } from "@/lib/data/schema";
import { logError, logInfo, logWarn } from "@/lib/utils/log";
import { getRequestId, runWithRequestContext } from "@/lib/utils/request-context";

const RATE_LIMIT_STORE = "newsletter";
const MAX_REQUESTS_PER_MINUTE = 3;

export const POST = withRequestContext(
  withRateLimit({
    maxHits: MAX_REQUESTS_PER_MINUTE,
    onLimit: ({ ipHash }) => {
      logWarn("newsletter.rate_limited", {
        ipHash,
        maxHits: MAX_REQUESTS_PER_MINUTE,
        requestId: getRequestId(),
        storeKey: RATE_LIMIT_STORE,
      });

      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    },
    storeKey: RATE_LIMIT_STORE,
  })(async (request: Request) => {
    const originAllowed = await isOriginAllowed();

    if (!originAllowed) {
      logWarn("newsletter.invalid_origin", { requestId: getRequestId() });

      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    }

    const verification = await checkBotId();

    if (verification.isBot) {
      logWarn("newsletter.bot_blocked", { requestId: getRequestId() });

      return NextResponse.json({ error: "Bot traffic blocked" }, { status: 403 });
    }

    const { ipHash, uaHash } = await getClientHashes();

    try {
      const body = await request.json();
      const { email } = newsletterSubscribeRequestSchema.parse(body);

      const result = await subscribeToNewsletter(email, ipHash, uaHash);
      const validated = newsletterSubscribeResponseSchema.parse({ subscribed: result.subscribed });

      return NextResponse.json(validated);
    } catch (error) {
      if (error && typeof error === "object" && "issues" in error) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }

      logError("newsletter.subscribe_failed", error);

      return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
  }),
);

type SubscribedAs = "newsletter" | "account" | "both";

function toSubscribedAs(newsletter: boolean, account: boolean): SubscribedAs {
  if (newsletter && account) {
    return "both";
  }
  if (newsletter) {
    return "newsletter";
  }
  return "account";
}

async function getSubscriptionStatus(email: string) {
  const database = db();
  const newsletterSub = await database.query.newsletterSubscription.findFirst({
    where: eq(newsletterSubscription.email, email),
  });
  const user = await database.query.appUser.findFirst({
    where: eq(appUser.email, email),
  });
  const prefs = user?.preferences as { allowCommunityEmails?: boolean } | null;
  const newsletter = Boolean(newsletterSub);
  const account = Boolean(prefs?.allowCommunityEmails);
  return { newsletter, account, user };
}

const unsubscribeSchema = z.object({
  token: z.string().min(1),
});

export const GET = (request: Request) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    let email: string;
    try {
      email = await verifyUnsubscribeToken(token);
    } catch {
      return respond({ error: "invalid_token" }, { status: 400 });
    }

    try {
      const { newsletter, account } = await getSubscriptionStatus(email);

      if (!newsletter && !account) {
        return respond({ subscribedAs: null, error: "not_subscribed" }, { status: 400 });
      }

      return respond({ subscribedAs: toSubscribedAs(newsletter, account) });
    } catch (error) {
      logError("newsletter.check_subscription_failed", error, { email });

      return respond({ error: "check_failed" }, { status: 500 });
    }
  });

export const DELETE = (request: Request) =>
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
      const { newsletter, account, user } = await getSubscriptionStatus(email);

      if (newsletter) {
        await database
          .delete(newsletterSubscription)
          .where(eq(newsletterSubscription.email, email));
      }

      if (account && user) {
        await database
          .update(appUser)
          .set({
            preferences: sql`jsonb_set(coalesce(${appUser.preferences}, '{}'::jsonb), '{allowCommunityEmails}', 'false'::jsonb)`,
          })
          .where(eq(appUser.id, user.id));
      }

      if (!newsletter && !account) {
        return respond({ error: "not_subscribed" }, { status: 400 });
      }

      logInfo("newsletter.unsubscribed", { email, results: { newsletter, account } });

      return respond({
        ok: true,
        email,
        unsubscribedFrom: toSubscribedAs(newsletter, account),
      });
    } catch (error) {
      logError("newsletter.unsubscribe_failed", error, { email });

      return respond({ error: "unsubscribe_failed" }, { status: 500 });
    }
  });
