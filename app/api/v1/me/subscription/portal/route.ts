import { NextResponse } from "next/server";

import { withAuth, withRequestContext } from "@/lib/api/route-wrappers";
import { guildSubscriptionLinkResponseSchema } from "@/lib/api/schemas";
import { createGuildPortalSession } from "@/lib/billing/stripe";
import { getGuildSubscriptionByUserId } from "@/lib/data/subscriptions";
import { logError } from "@/lib/utils/log";

export const POST = withRequestContext(
  withAuth("account.subscription.portal")(async (request: Request, { auth }) => {
    try {
      const subscription = await getGuildSubscriptionByUserId(auth.userId);

      if (!subscription?.stripeCustomerId) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      const session = await createGuildPortalSession(subscription.stripeCustomerId, request);

      return NextResponse.json(guildSubscriptionLinkResponseSchema.parse({ url: session.url }));
    } catch (error) {
      logError("account.subscription.portal.failed", error, { userId: auth.userId });
      return NextResponse.json({ error: "portal_failed" }, { status: 500 });
    }
  }),
);
