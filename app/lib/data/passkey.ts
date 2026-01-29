import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { and, count, eq, gt, isNull, lt, sql } from "drizzle-orm";

import { db } from "@/lib/data/db";
import { authPasskey, authPasskeyChallenge } from "@/lib/data/schema";

export interface PasskeyRow {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceType: string | null;
  backedUp: boolean;
  transports: string[] | null;
  name: string | null;
  createdAt: Date;
  lastUsedAt: Date | null;
}

export interface PasskeyChallengeRow {
  id: string;
  userId: string | null;
  challenge: string;
  type: string;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export const insertPasskey = async ({
  userId,
  credentialId,
  publicKey,
  counter,
  deviceType,
  backedUp,
  transports,
  name,
}: {
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  deviceType?: string | null;
  backedUp?: boolean;
  transports?: AuthenticatorTransportFuture[] | null;
  name?: string | null;
}): Promise<string | null> => {
  const rows = await db()
    .insert(authPasskey)
    .values({
      userId,
      credentialId,
      publicKey,
      counter,
      deviceType: deviceType ?? null,
      backedUp: backedUp ?? false,
      transports: transports ?? null,
      name: name ?? null,
    })
    .returning({ id: authPasskey.id });

  return rows[0]?.id ?? null;
};

export const getPasskeysByUserId = async (userId: string): Promise<PasskeyRow[]> => {
  const rows = await db()
    .select({
      id: authPasskey.id,
      userId: authPasskey.userId,
      credentialId: authPasskey.credentialId,
      publicKey: authPasskey.publicKey,
      counter: authPasskey.counter,
      deviceType: authPasskey.deviceType,
      backedUp: authPasskey.backedUp,
      transports: authPasskey.transports,
      name: authPasskey.name,
      createdAt: authPasskey.createdAt,
      lastUsedAt: authPasskey.lastUsedAt,
    })
    .from(authPasskey)
    .where(eq(authPasskey.userId, userId))
    .orderBy(sql`${authPasskey.createdAt} DESC`);

  return rows;
};

export const getPasskeyByCredentialId = async (
  credentialId: string,
): Promise<PasskeyRow | null> => {
  const rows = await db()
    .select({
      id: authPasskey.id,
      userId: authPasskey.userId,
      credentialId: authPasskey.credentialId,
      publicKey: authPasskey.publicKey,
      counter: authPasskey.counter,
      deviceType: authPasskey.deviceType,
      backedUp: authPasskey.backedUp,
      transports: authPasskey.transports,
      name: authPasskey.name,
      createdAt: authPasskey.createdAt,
      lastUsedAt: authPasskey.lastUsedAt,
    })
    .from(authPasskey)
    .where(eq(authPasskey.credentialId, credentialId))
    .limit(1);

  return rows[0] ?? null;
};

export const getPasskeyById = async (id: string): Promise<PasskeyRow | null> => {
  const rows = await db()
    .select({
      id: authPasskey.id,
      userId: authPasskey.userId,
      credentialId: authPasskey.credentialId,
      publicKey: authPasskey.publicKey,
      counter: authPasskey.counter,
      deviceType: authPasskey.deviceType,
      backedUp: authPasskey.backedUp,
      transports: authPasskey.transports,
      name: authPasskey.name,
      createdAt: authPasskey.createdAt,
      lastUsedAt: authPasskey.lastUsedAt,
    })
    .from(authPasskey)
    .where(eq(authPasskey.id, id))
    .limit(1);

  return rows[0] ?? null;
};

export const updatePasskeyCounter = async (credentialId: string, counter: number) => {
  await db()
    .update(authPasskey)
    .set({ counter, lastUsedAt: new Date() })
    .where(eq(authPasskey.credentialId, credentialId));
};

export const updatePasskeyName = async (id: string, userId: string, name: string | null) => {
  await db()
    .update(authPasskey)
    .set({ name })
    .where(and(eq(authPasskey.id, id), eq(authPasskey.userId, userId)));
};

export const deletePasskey = async (id: string, userId: string): Promise<boolean> => {
  const result = await db()
    .delete(authPasskey)
    .where(and(eq(authPasskey.id, id), eq(authPasskey.userId, userId)))
    .returning({ id: authPasskey.id });

  return result.length > 0;
};

export const getPasskeyCountByUserId = async (userId: string): Promise<number> => {
  const rows = await db()
    .select({ count: count() })
    .from(authPasskey)
    .where(eq(authPasskey.userId, userId));

  return rows[0]?.count ?? 0;
};

export const insertPasskeyChallenge = async ({
  userId,
  challenge,
  type,
  expiresAt,
}: {
  userId?: string | null;
  challenge: string;
  type: "registration" | "authentication";
  expiresAt: Date;
}): Promise<string | null> => {
  const rows = await db()
    .insert(authPasskeyChallenge)
    .values({
      userId: userId ?? null,
      challenge,
      type,
      expiresAt,
    })
    .returning({ id: authPasskeyChallenge.id });

  return rows[0]?.id ?? null;
};

export const getPasskeyChallenge = async (
  challenge: string,
  type: "registration" | "authentication",
): Promise<PasskeyChallengeRow | null> => {
  const rows = await db()
    .select({
      id: authPasskeyChallenge.id,
      userId: authPasskeyChallenge.userId,
      challenge: authPasskeyChallenge.challenge,
      type: authPasskeyChallenge.type,
      expiresAt: authPasskeyChallenge.expiresAt,
      usedAt: authPasskeyChallenge.usedAt,
      createdAt: authPasskeyChallenge.createdAt,
    })
    .from(authPasskeyChallenge)
    .where(
      and(
        eq(authPasskeyChallenge.challenge, challenge),
        eq(authPasskeyChallenge.type, type),
        isNull(authPasskeyChallenge.usedAt),
        gt(authPasskeyChallenge.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
};

export const markPasskeyChallengeUsed = async (id: string) => {
  await db()
    .update(authPasskeyChallenge)
    .set({ usedAt: new Date() })
    .where(eq(authPasskeyChallenge.id, id));
};

export const cleanupExpiredPasskeyChallenges = async () => {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000);
  await db().delete(authPasskeyChallenge).where(lt(authPasskeyChallenge.expiresAt, cutoff));
};

export const maybeCleanupExpiredPasskeyChallenges = async () => {
  if (Math.random() < 0.05) {
    await cleanupExpiredPasskeyChallenges();
  }
};
