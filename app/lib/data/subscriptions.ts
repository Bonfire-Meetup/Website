import "server-only";

import { eq, sql } from "drizzle-orm";

import type { GuildMembershipTier } from "@/lib/config/subscriptions";
import { db, runTransaction } from "@/lib/data/db";
import { appUser, guildSubscription } from "@/lib/data/schema";

export interface GuildSubscriptionRow {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  membershipTier: number | null;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  lastInvoiceId: string | null;
  lastInvoiceStatus: string | null;
  lastChargeAmount: number | null;
  lastChargeCurrency: string | null;
  lastChargeAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const GUILD_ACTIVE_STATUSES = new Set(["active", "trialing"]);

export const isGuildSubscriptionEntitled = (status: string | null | undefined): boolean =>
  Boolean(status && GUILD_ACTIVE_STATUSES.has(status));

export const getGuildSubscriptionByUserId = async (
  userId: string,
): Promise<GuildSubscriptionRow | null> => {
  const rows = await db()
    .select()
    .from(guildSubscription)
    .where(eq(guildSubscription.userId, userId))
    .limit(1);

  return rows[0] ?? null;
};

export const getGuildSubscriptionByStripeCustomerId = async (
  stripeCustomerId: string,
): Promise<GuildSubscriptionRow | null> => {
  const rows = await db()
    .select()
    .from(guildSubscription)
    .where(eq(guildSubscription.stripeCustomerId, stripeCustomerId))
    .limit(1);

  return rows[0] ?? null;
};

export const getGuildSubscriptionByStripeSubscriptionId = async (
  stripeSubscriptionId: string,
): Promise<GuildSubscriptionRow | null> => {
  const rows = await db()
    .select()
    .from(guildSubscription)
    .where(eq(guildSubscription.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  return rows[0] ?? null;
};

export const updateGuildSubscriptionInvoiceFields = async ({
  stripeSubscriptionId,
  lastInvoiceId,
  lastInvoiceStatus,
  lastChargeAmount,
  lastChargeCurrency,
  lastChargeAt,
}: {
  stripeSubscriptionId: string;
  lastInvoiceId?: string | null;
  lastInvoiceStatus?: string | null;
  lastChargeAmount?: number | null;
  lastChargeCurrency?: string | null;
  lastChargeAt?: string | null;
}) => {
  await db()
    .update(guildSubscription)
    .set({
      lastInvoiceId: lastInvoiceId ?? null,
      lastInvoiceStatus: lastInvoiceStatus ?? null,
      lastChargeAmount: lastChargeAmount ?? null,
      lastChargeCurrency: lastChargeCurrency ?? null,
      lastChargeAt: lastChargeAt ?? null,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(guildSubscription.stripeSubscriptionId, stripeSubscriptionId));
};

/**
 * Stores the given Stripe subscription as the user's Guild subscription and updates their
 * membership tier. A subscription that grants no access never replaces a different one that
 * still does, so events for an old or duplicate subscription cannot revoke a paying member.
 * Returns false when the stored subscription was kept.
 */
export const syncGuildEntitlementState = ({
  userId,
  stripeCustomerId,
  stripeSubscriptionId,
  stripePriceId,
  membershipTier,
  status,
  cancelAtPeriodEnd,
  currentPeriodStart,
  currentPeriodEnd,
}: {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  membershipTier: GuildMembershipTier | null;
  status: string | null;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}): Promise<boolean> => {
  const isEntitled = isGuildSubscriptionEntitled(status);
  const entitledTier = isEntitled ? membershipTier : null;
  const now = new Date().toISOString();

  return runTransaction(async (tx) => {
    const written = await tx
      .insert(guildSubscription)
      .values({
        userId,
        stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId,
        membershipTier,
        status,
        cancelAtPeriodEnd,
        currentPeriodStart,
        currentPeriodEnd,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: guildSubscription.userId,
        set: {
          stripeCustomerId,
          stripeSubscriptionId,
          stripePriceId,
          membershipTier,
          status,
          cancelAtPeriodEnd,
          currentPeriodStart,
          currentPeriodEnd,
          updatedAt: now,
        },
        setWhere: isEntitled
          ? undefined
          : sql`${guildSubscription.stripeSubscriptionId} is null or ${guildSubscription.stripeSubscriptionId} = ${stripeSubscriptionId} or ${guildSubscription.status} is null or ${guildSubscription.status} not in ('active', 'trialing')`,
      })
      .returning({ userId: guildSubscription.userId });

    if (written.length === 0) {
      return false;
    }

    await tx.update(appUser).set({ membershipTier: entitledTier }).where(eq(appUser.id, userId));

    return true;
  });
};

export const deleteGuildSubscriptionByUserId = async (userId: string) => {
  await db().delete(guildSubscription).where(eq(guildSubscription.userId, userId));
};

export const findGuildUserIdByStripeReferences = async ({
  stripeCustomerId,
  stripeSubscriptionId,
}: {
  stripeCustomerId?: string | null;
  stripeSubscriptionId?: string | null;
}): Promise<string | null> => {
  if (stripeSubscriptionId) {
    const row = await getGuildSubscriptionByStripeSubscriptionId(stripeSubscriptionId);
    if (row) {
      return row.userId;
    }
  }

  if (stripeCustomerId) {
    const row = await getGuildSubscriptionByStripeCustomerId(stripeCustomerId);
    if (row) {
      return row.userId;
    }
  }

  return null;
};

export const hasManagedGuildSubscription = (row: GuildSubscriptionRow | null): boolean => {
  if (!row) {
    return false;
  }

  return Boolean(
    row.stripeSubscriptionId &&
    row.status &&
    !["canceled", "incomplete_expired"].includes(row.status),
  );
};

export const clearGuildSubscriptionByUserId = async (userId: string) => {
  const now = new Date().toISOString();

  await runTransaction(async (tx) => {
    await tx
      .update(guildSubscription)
      .set({
        stripeSubscriptionId: null,
        stripePriceId: null,
        membershipTier: null,
        status: "canceled",
        cancelAtPeriodEnd: false,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        updatedAt: now,
      })
      .where(eq(guildSubscription.userId, userId));

    await tx.update(appUser).set({ membershipTier: null }).where(eq(appUser.id, userId));
  });
};

export const touchGuildSubscriptionTimestamp = async (userId: string) => {
  await db()
    .update(guildSubscription)
    .set({ updatedAt: new Date().toISOString() })
    .where(eq(guildSubscription.userId, userId));
};

/**
 * Records the user's Stripe customer unless one is already stored, and returns the stored one so
 * concurrent callers agree on a single customer.
 */
export const claimGuildSubscriptionCustomer = async ({
  userId,
  stripeCustomerId,
}: {
  userId: string;
  stripeCustomerId: string;
}): Promise<string> => {
  const inserted = await db()
    .insert(guildSubscription)
    .values({ userId, stripeCustomerId, updatedAt: new Date().toISOString() })
    .onConflictDoNothing({ target: guildSubscription.userId })
    .returning({ stripeCustomerId: guildSubscription.stripeCustomerId });

  if (inserted[0]) {
    return inserted[0].stripeCustomerId;
  }

  const existing = await getGuildSubscriptionByUserId(userId);

  if (!existing) {
    throw new Error("Guild subscription row missing after customer claim");
  }

  return existing.stripeCustomerId;
};
