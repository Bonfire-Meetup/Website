import "server-only";

import { eq } from "drizzle-orm";

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

interface UpsertGuildSubscriptionInput {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  stripePriceId?: string | null;
  membershipTier?: GuildMembershipTier | null;
  status?: string | null;
  cancelAtPeriodEnd?: boolean;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  lastInvoiceId?: string | null;
  lastInvoiceStatus?: string | null;
  lastChargeAmount?: number | null;
  lastChargeCurrency?: string | null;
  lastChargeAt?: string | null;
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

export const upsertGuildSubscription = async (
  input: UpsertGuildSubscriptionInput,
): Promise<void> => {
  const now = new Date().toISOString();

  await db()
    .insert(guildSubscription)
    .values({
      userId: input.userId,
      stripeCustomerId: input.stripeCustomerId,
      stripeSubscriptionId: input.stripeSubscriptionId ?? null,
      stripePriceId: input.stripePriceId ?? null,
      membershipTier: input.membershipTier ?? null,
      status: input.status ?? null,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      lastInvoiceId: input.lastInvoiceId ?? null,
      lastInvoiceStatus: input.lastInvoiceStatus ?? null,
      lastChargeAmount: input.lastChargeAmount ?? null,
      lastChargeCurrency: input.lastChargeCurrency ?? null,
      lastChargeAt: input.lastChargeAt ?? null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: guildSubscription.userId,
      set: {
        stripeCustomerId: input.stripeCustomerId,
        stripeSubscriptionId: input.stripeSubscriptionId ?? null,
        stripePriceId: input.stripePriceId ?? null,
        membershipTier: input.membershipTier ?? null,
        status: input.status ?? null,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd ?? false,
        currentPeriodStart: input.currentPeriodStart ?? null,
        currentPeriodEnd: input.currentPeriodEnd ?? null,
        lastInvoiceId: input.lastInvoiceId ?? null,
        lastInvoiceStatus: input.lastInvoiceStatus ?? null,
        lastChargeAmount: input.lastChargeAmount ?? null,
        lastChargeCurrency: input.lastChargeCurrency ?? null,
        lastChargeAt: input.lastChargeAt ?? null,
        updatedAt: now,
      },
    });
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

export const syncGuildEntitlementState = async ({
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
}) => {
  const entitledTier = isGuildSubscriptionEntitled(status) ? membershipTier : null;
  const now = new Date().toISOString();

  await runTransaction(async (tx) => {
    await tx
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
      });

    await tx.update(appUser).set({ membershipTier: entitledTier }).where(eq(appUser.id, userId));
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

export const markGuildSubscriptionCustomer = async ({
  userId,
  stripeCustomerId,
}: {
  userId: string;
  stripeCustomerId: string;
}) => {
  const existing = await getGuildSubscriptionByUserId(userId);

  await upsertGuildSubscription({
    userId,
    stripeCustomerId,
    stripeSubscriptionId: existing?.stripeSubscriptionId ?? null,
    stripePriceId: existing?.stripePriceId ?? null,
    membershipTier: (existing?.membershipTier as GuildMembershipTier | null | undefined) ?? null,
    status: existing?.status ?? null,
    cancelAtPeriodEnd: existing?.cancelAtPeriodEnd ?? false,
    currentPeriodStart: existing?.currentPeriodStart ?? null,
    currentPeriodEnd: existing?.currentPeriodEnd ?? null,
    lastInvoiceId: existing?.lastInvoiceId ?? null,
    lastInvoiceStatus: existing?.lastInvoiceStatus ?? null,
    lastChargeAmount: existing?.lastChargeAmount ?? null,
    lastChargeCurrency: existing?.lastChargeCurrency ?? null,
    lastChargeAt: existing?.lastChargeAt ?? null,
  });
};
