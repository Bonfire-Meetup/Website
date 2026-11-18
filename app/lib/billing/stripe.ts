import "server-only";

import Stripe from "stripe";

import { serverEnv } from "@/lib/config/env";
import {
  getGuildTierByPriceId,
  getGuildTierPriceId,
  getStripeAppBaseUrl,
  getStripePortalReturnUrl,
  type GuildMembershipTier,
} from "@/lib/config/subscriptions";
import { getAuthUserById } from "@/lib/data/auth";
import {
  claimGuildSubscriptionCustomer,
  findGuildUserIdByStripeReferences,
  getGuildSubscriptionByUserId,
  syncGuildEntitlementState,
  updateGuildSubscriptionInvoiceFields,
} from "@/lib/data/subscriptions";
import { createMeGuildJoinUrl } from "@/lib/routes/app-search-params";
import { logInfo, logWarn } from "@/lib/utils/log";

let stripeClient: Stripe | null = null;

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);
const ENDED_SUBSCRIPTION_STATUSES = new Set(["canceled", "incomplete_expired"]);

const isStripeResourceMissing = (error: unknown): boolean =>
  error instanceof Stripe.errors.StripeInvalidRequestError && error.code === "resource_missing";

export const getStripe = (): Stripe => {
  if (stripeClient) {
    return stripeClient;
  }

  if (!serverEnv.BNF_STRIPE_SECRET_KEY) {
    throw new Error("BNF_STRIPE_SECRET_KEY is not configured");
  }

  stripeClient = new Stripe(serverEnv.BNF_STRIPE_SECRET_KEY);

  return stripeClient;
};

export const getStripeWebhookSecret = (): string => {
  if (!serverEnv.BNF_STRIPE_WEBHOOK_SECRET) {
    throw new Error("BNF_STRIPE_WEBHOOK_SECRET is not configured");
  }

  return serverEnv.BNF_STRIPE_WEBHOOK_SECRET;
};

export const getGuildSubscriptionStatusIsActive = (status: string | null | undefined): boolean =>
  Boolean(status && ACTIVE_SUBSCRIPTION_STATUSES.has(status));

const toIsoOrNull = (unixSeconds: number | null | undefined): string | null =>
  typeof unixSeconds === "number" ? new Date(unixSeconds * 1000).toISOString() : null;

const getSubscriptionPriceId = (subscription: Stripe.Subscription): string | null =>
  subscription.items.data[0]?.price?.id ?? null;

const getSchedulePhasePriceId = (phase: Stripe.SubscriptionSchedule.Phase): string | null => {
  const price = phase.items[0]?.price;

  if (!price) {
    return null;
  }

  return typeof price === "string" ? price : price.id;
};

const getSubscriptionPeriodBounds = (subscription: Stripe.Subscription) => ({
  currentPeriodStart: toIsoOrNull(subscription.items.data[0]?.current_period_start),
  currentPeriodEnd: toIsoOrNull(subscription.items.data[0]?.current_period_end),
});

export const resolveGuildTierFromSubscription = (
  subscription: Stripe.Subscription,
): GuildMembershipTier | null => getGuildTierByPriceId(getSubscriptionPriceId(subscription));

export const ensureStripeCustomerForUser = async (userId: string): Promise<string> => {
  const existing = await getGuildSubscriptionByUserId(userId);

  if (existing?.stripeCustomerId) {
    return existing.stripeCustomerId;
  }

  const user = await getAuthUserById(userId);

  if (!user) {
    throw new Error("User not found for Stripe customer creation");
  }

  const customer = await getStripe().customers.create(
    {
      email: user.email,
      metadata: {
        userId,
      },
      name: user.name ?? undefined,
    },
    { idempotencyKey: `guild-customer-${userId}` },
  );

  return claimGuildSubscriptionCustomer({
    userId,
    stripeCustomerId: customer.id,
  });
};

const findLiveStripeSubscription = async (
  customerId: string,
): Promise<Stripe.Subscription | null> => {
  const subscriptions = await getStripe().subscriptions.list({ customer: customerId, limit: 10 });

  return (
    subscriptions.data.find(
      (subscription) => !ENDED_SUBSCRIPTION_STATUSES.has(subscription.status),
    ) ?? null
  );
};

const expireOpenCheckoutSessions = async (customerId: string) => {
  const sessions = await getStripe().checkout.sessions.list({
    customer: customerId,
    status: "open",
    limit: 20,
  });

  await Promise.all(
    sessions.data.map(async (session) => {
      try {
        await getStripe().checkout.sessions.expire(session.id);
      } catch (error) {
        logWarn("stripe.checkout.expire_failed", {
          checkoutSessionId: session.id,
          error: error instanceof Error ? error.message : "unknown_error",
        });
      }
    }),
  );
};

export const createGuildPortalSession = (customerId: string, request: Request) =>
  getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: getStripePortalReturnUrl(request),
  });

export const syncGuildSubscriptionFromStripe = async ({
  subscription,
  userId,
}: {
  subscription: Stripe.Subscription;
  userId?: string | null;
}) => {
  const resolvedUserId =
    userId ??
    (typeof subscription.metadata.userId === "string" && subscription.metadata.userId.length > 0
      ? subscription.metadata.userId
      : await findGuildUserIdByStripeReferences({
          stripeCustomerId:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id,
          stripeSubscriptionId: subscription.id,
        }));

  if (!resolvedUserId) {
    logWarn("stripe.subscription.user_not_resolved", {
      stripeCustomerId:
        typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer?.id,
      stripeSubscriptionId: subscription.id,
    });
    return;
  }

  if (!(await getAuthUserById(resolvedUserId))) {
    logWarn("stripe.subscription.user_deleted", {
      stripeSubscriptionId: subscription.id,
      userId: resolvedUserId,
    });
    return;
  }

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  const { currentPeriodEnd, currentPeriodStart } = getSubscriptionPeriodBounds(subscription);

  if (!customerId) {
    throw new Error("Stripe subscription missing customer id");
  }

  const applied = await syncGuildEntitlementState({
    userId: resolvedUserId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: getSubscriptionPriceId(subscription),
    membershipTier: resolveGuildTierFromSubscription(subscription),
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    currentPeriodStart,
    currentPeriodEnd,
  });

  if (!applied) {
    logWarn("stripe.subscription.kept_active_subscription", {
      userId: resolvedUserId,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
    });
    return;
  }

  logInfo("stripe.subscription.synced", {
    userId: resolvedUserId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
  });
};

/**
 * Starts Checkout for a tier. Refuses when Stripe already has a live subscription for the user,
 * and expires their other open Checkout sessions so only the newest one can be paid.
 */
export const createGuildCheckoutSession = async ({
  request,
  tier,
  userId,
}: {
  request: Request;
  tier: GuildMembershipTier;
  userId: string;
}): Promise<{ status: "existing_subscription" } | { status: "created"; url: string }> => {
  const customerId = await ensureStripeCustomerForUser(userId);
  const liveSubscription = await findLiveStripeSubscription(customerId);

  if (liveSubscription) {
    await syncGuildSubscriptionFromStripe({ subscription: liveSubscription, userId });
    return { status: "existing_subscription" };
  }

  await expireOpenCheckoutSessions(customerId);

  const priceId = getGuildTierPriceId(tier);
  const baseUrl = getStripeAppBaseUrl(request);

  const session = await getStripe().checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: userId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: `${baseUrl}/me?checkout-state=success&guild-checkout-session-id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}${createMeGuildJoinUrl({ tier, checkout: "canceled" })}`,
    allow_promotion_codes: true,
    metadata: {
      tier: String(tier),
      userId,
    },
    subscription_data: {
      metadata: {
        tier: String(tier),
        userId,
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe checkout session missing URL");
  }

  return { status: "created", url: session.url };
};

/**
 * Deletes the user's Stripe customer, which also cancels its subscriptions immediately. Run it
 * before deleting the account so nobody keeps paying for an account that no longer exists.
 */
export const deleteStripeCustomerForUser = async (userId: string) => {
  const row = await getGuildSubscriptionByUserId(userId);

  if (!row?.stripeCustomerId) {
    return;
  }

  try {
    await getStripe().customers.del(row.stripeCustomerId);
  } catch (error) {
    if (!isStripeResourceMissing(error)) {
      throw error;
    }
  }

  logInfo("stripe.customer.deleted_with_account", {
    stripeCustomerId: row.stripeCustomerId,
    userId,
  });
};

export const syncGuildInvoiceFromStripe = async (invoice: Stripe.Invoice) => {
  const subscriptionReference = invoice.parent?.subscription_details?.subscription;
  const stripeSubscriptionId =
    typeof subscriptionReference === "string" ? subscriptionReference : subscriptionReference?.id;

  if (!stripeSubscriptionId) {
    return;
  }

  const invoiceTimestamp =
    typeof invoice.status_transitions?.paid_at === "number"
      ? invoice.status_transitions.paid_at
      : invoice.created;

  await updateGuildSubscriptionInvoiceFields({
    stripeSubscriptionId,
    lastInvoiceId: invoice.id,
    lastInvoiceStatus: invoice.status ?? null,
    lastChargeAmount:
      invoice.status === "paid" ? invoice.amount_paid : (invoice.amount_due ?? invoice.amount_paid),
    lastChargeCurrency: invoice.currency ?? null,
    lastChargeAt: toIsoOrNull(invoiceTimestamp),
  });
};

export const getGuildUpcomingInvoiceSummary = async ({
  customerId,
  subscriptionId,
}: {
  customerId: string;
  subscriptionId: string;
}) => {
  try {
    const invoice = await getStripe().invoices.createPreview({
      customer: customerId,
      subscription: subscriptionId,
    });

    return {
      amount: invoice.amount_due,
      currency: invoice.currency,
      dueAt: toIsoOrNull(invoice.due_date ?? invoice.period_end),
    };
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return null;
    }

    throw error;
  }
};

export const getGuildScheduledChangeSummary = async ({
  subscriptionId,
}: {
  subscriptionId: string;
}) => {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
    expand: ["schedule"],
  });
  const { schedule } = subscription;

  if (!schedule || typeof schedule === "string") {
    return null;
  }

  const currentPhaseEnd = schedule.current_phase?.end_date ?? null;

  if (!currentPhaseEnd) {
    return null;
  }

  const nextPhase = schedule.phases.find((phase) => phase.start_date >= currentPhaseEnd);

  if (!nextPhase) {
    return null;
  }

  const nextTier = getGuildTierByPriceId(getSchedulePhasePriceId(nextPhase));

  if (!nextTier) {
    return null;
  }

  const currentTier = resolveGuildTierFromSubscription(subscription);

  if (currentTier === nextTier) {
    return null;
  }

  return {
    effectiveAt: toIsoOrNull(nextPhase.start_date),
    tier: nextTier,
  };
};

export const getGuildSubscriptionFromStripeSession = async (sessionId: string) => {
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["subscription"],
  });
  const { subscription } = session;

  if (!subscription || typeof subscription === "string") {
    return null;
  }

  return subscription;
};
