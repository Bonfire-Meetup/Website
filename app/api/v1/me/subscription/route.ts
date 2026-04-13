import { NextResponse } from "next/server";

import { withAuth, withRequestContext } from "@/lib/api/route-wrappers";
import { guildSubscriptionSummarySchema } from "@/lib/api/schemas";
import {
  getGuildScheduledChangeSummary,
  getGuildUpcomingInvoiceSummary,
} from "@/lib/billing/stripe";
import {
  getGuildSubscriptionByUserId,
  isGuildSubscriptionEntitled,
} from "@/lib/data/subscriptions";
import { logError } from "@/lib/utils/log";

const EMPTY_GUILD_SUBSCRIPTION_SUMMARY = {
  tier: null,
  status: null,
  isActive: false,
  cancelAtPeriodEnd: false,
  scheduledChange: null,
  currentPeriodStart: null,
  currentPeriodEnd: null,
  lastCharge: null,
  upcomingCharge: null,
};

const buildGuildSubscriptionSummary = (summary: unknown) =>
  guildSubscriptionSummarySchema.parse(summary);

function toIsoDateTime(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.includes("T") ? value.replace(" ", "T") : value;
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString();
}

export const GET = withRequestContext(
  withAuth("account.subscription")(async (_request: Request, { auth }) => {
    try {
      const subscription = await getGuildSubscriptionByUserId(auth.userId);

      if (!subscription) {
        return NextResponse.json(buildGuildSubscriptionSummary(EMPTY_GUILD_SUBSCRIPTION_SUMMARY));
      }

      const [upcomingCharge, scheduledChange] =
        subscription.stripeCustomerId && subscription.stripeSubscriptionId
          ? await Promise.all([
              getGuildUpcomingInvoiceSummary({
                customerId: subscription.stripeCustomerId,
                subscriptionId: subscription.stripeSubscriptionId,
              }),
              getGuildScheduledChangeSummary({
                subscriptionId: subscription.stripeSubscriptionId,
              }),
            ])
          : [null, null];

      return NextResponse.json(
        buildGuildSubscriptionSummary({
          tier: subscription.membershipTier,
          status: subscription.status,
          isActive: isGuildSubscriptionEntitled(subscription.status),
          cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
          scheduledChange,
          currentPeriodStart: toIsoDateTime(subscription.currentPeriodStart),
          currentPeriodEnd: toIsoDateTime(subscription.currentPeriodEnd),
          lastCharge:
            subscription.lastChargeAmount !== null
              ? {
                  amount: subscription.lastChargeAmount,
                  currency: subscription.lastChargeCurrency ?? "usd",
                  paidAt: toIsoDateTime(subscription.lastChargeAt),
                  status: subscription.lastInvoiceStatus,
                }
              : null,
          upcomingCharge: upcomingCharge
            ? {
                amount: upcomingCharge.amount,
                currency: upcomingCharge.currency,
                dueAt: upcomingCharge.dueAt,
                status: "upcoming",
              }
            : null,
        }),
      );
    } catch (error) {
      logError("account.subscription.failed", error, { userId: auth.userId });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
