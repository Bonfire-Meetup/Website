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
  findGuildUserIdByStripeReferences,
  getGuildSubscriptionByUserId,
  markGuildSubscriptionCustomer,
  syncGuildEntitlementState,
  updateGuildSubscriptionInvoiceFields,
} from "@/lib/data/subscriptions";
import { createMeGuildJoinUrl } from "@/lib/routes/app-search-params";
import { logInfo, logWarn } from "@/lib/utils/log";

let stripeClient: Stripe | null = null;

const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

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

  const customer = await getStripe().customers.create({
    email: user.email,
    metadata: {
      userId,
    },
    name: user.name ?? undefined,
  });

  await markGuildSubscriptionCustomer({
    userId,
    stripeCustomerId: customer.id,
  });

  return customer.id;
};

export const createGuildCheckoutSession = async ({
  request,
  tier,
  userId,
}: {
  request: Request;
  tier: GuildMembershipTier;
  userId: string;
}) => {
  const customerId = await ensureStripeCustomerForUser(userId);
  const priceId = getGuildTierPriceId(tier);
  const baseUrl = getStripeAppBaseUrl(request);

  return getStripe().checkout.sessions.create({
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

  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  const { currentPeriodEnd, currentPeriodStart } = getSubscriptionPeriodBounds(subscription);

  if (!customerId) {
    throw new Error("Stripe subscription missing customer id");
  }

  await syncGuildEntitlementState({
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

  logInfo("stripe.subscription.synced", {
    userId: resolvedUserId,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
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
