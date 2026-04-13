import { NextResponse } from "next/server";

import { withAuth, withRequestContext } from "@/lib/api/route-wrappers";
import {
  guildSubscriptionCheckoutRequestSchema,
  guildSubscriptionLinkResponseSchema,
} from "@/lib/api/schemas";
import { createGuildCheckoutSession } from "@/lib/billing/stripe";
import { isGuildSubscriptionEnabled } from "@/lib/config/guild-subscription-feature";
import {
  getGuildSubscriptionByUserId,
  hasManagedGuildSubscription,
  isGuildSubscriptionEntitled,
} from "@/lib/data/subscriptions";
import { logError, logWarn } from "@/lib/utils/log";

export const POST = withRequestContext(
  withAuth("account.subscription.checkout")(async (request: Request, { auth }) => {
    if (!isGuildSubscriptionEnabled()) {
      return NextResponse.json({ error: "feature_disabled" }, { status: 404 });
    }

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const parsed = guildSubscriptionCheckoutRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    try {
      const existing = await getGuildSubscriptionByUserId(auth.userId);

      if (
        existing &&
        isGuildSubscriptionEntitled(existing.status) &&
        existing.membershipTier === parsed.data.tier
      ) {
        return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
      }

      if (hasManagedGuildSubscription(existing)) {
        logWarn("account.subscription.checkout.managed_in_portal", {
          requestedTier: parsed.data.tier,
          userId: auth.userId,
        });
        return NextResponse.json({ error: "subscription_managed_in_portal" }, { status: 409 });
      }

      const session = await createGuildCheckoutSession({
        request,
        tier: parsed.data.tier,
        userId: auth.userId,
      });

      if (!session.url) {
        throw new Error("Stripe checkout session missing URL");
      }

      return NextResponse.json(guildSubscriptionLinkResponseSchema.parse({ url: session.url }));
    } catch (error) {
      logError("account.subscription.checkout.failed", error, {
        requestedTier: parsed.data.tier,
        userId: auth.userId,
      });
      return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
    }
  }),
);
