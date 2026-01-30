import { and, count, eq, gt, isNull, lt, or, sql } from "drizzle-orm";

import { db } from "@/lib/data/db";
import {
  appUser,
  authAttempt,
  authChallenge,
  authRefreshToken,
  authToken,
} from "@/lib/data/schema";

interface AuthChallengeRow {
  id: string;
  codeHash: string;
  attempts: number;
  maxAttempts: number;
  expiresAt: string;
}

type AuthChallengeStatusRow = AuthChallengeRow & {
  usedAt: string | null;
};

interface UserPreferences {
  allowCommunityEmails?: boolean;
  publicProfile?: boolean;
}

interface AuthUserRow {
  id: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
  preferences: UserPreferences;
  name: string | null;
  roles: string[];
  membershipTier: number | null;
}

const getUserPreferences = (preferencesJson: unknown): UserPreferences => {
  const prefs = (preferencesJson || {}) as Record<string, unknown>;
  return {
    allowCommunityEmails:
      typeof prefs.allowCommunityEmails === "boolean" ? prefs.allowCommunityEmails : false,
    publicProfile: typeof prefs.publicProfile === "boolean" ? prefs.publicProfile : false,
  };
};

export const insertAuthChallenge = async ({
  challengeTokenHash,
  email,
  codeHash,
  expiresAt,
  maxAttempts,
  ip,
  userAgent,
}: {
  challengeTokenHash: string;
  email: string;
  codeHash: string;
  expiresAt: string;
  maxAttempts: number;
  ip: string | null;
  userAgent: string | null;
}) => {
  const rows = await db()
    .insert(authChallenge)
    .values({
      challengeTokenHash,
      email,
      codeHash,
      expiresAt,
      maxAttempts,
      ip,
      userAgent,
    })
    .returning({ id: authChallenge.id });

  return rows[0]?.id ?? null;
};

export const getActiveChallengeByToken = async (
  challengeTokenHash: string,
  email: string,
): Promise<AuthChallengeRow | null> => {
  const rows = await db()
    .select({
      id: authChallenge.id,
      codeHash: authChallenge.codeHash,
      attempts: authChallenge.attempts,
      maxAttempts: authChallenge.maxAttempts,
      expiresAt: authChallenge.expiresAt,
    })
    .from(authChallenge)
    .where(
      and(
        eq(authChallenge.challengeTokenHash, challengeTokenHash),
        eq(authChallenge.email, email),
        isNull(authChallenge.usedAt),
        gt(authChallenge.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);

  return rows[0] ?? null;
};

export const getChallengeByToken = async (
  challengeTokenHash: string,
  email: string,
): Promise<AuthChallengeStatusRow | null> => {
  const rows = await db()
    .select({
      id: authChallenge.id,
      codeHash: authChallenge.codeHash,
      attempts: authChallenge.attempts,
      maxAttempts: authChallenge.maxAttempts,
      expiresAt: authChallenge.expiresAt,
      usedAt: authChallenge.usedAt,
    })
    .from(authChallenge)
    .where(
      and(eq(authChallenge.challengeTokenHash, challengeTokenHash), eq(authChallenge.email, email)),
    )
    .orderBy(sql`${authChallenge.createdAt} DESC`)
    .limit(1);

  return rows[0] ?? null;
};

export const incrementAuthChallengeAttempts = async (id: string) => {
  await db()
    .update(authChallenge)
    .set({ attempts: sql`${authChallenge.attempts} + 1` })
    .where(eq(authChallenge.id, id));
};

export const markAuthChallengeUsed = async (id: string) => {
  await db()
    .update(authChallenge)
    .set({ usedAt: new Date().toISOString() })
    .where(eq(authChallenge.id, id));
};

export const upsertAuthUser = async (email: string): Promise<string> => {
  const now = new Date().toISOString();
  const rows = await db()
    .insert(appUser)
    .values({ email, lastLoginAt: now })
    .onConflictDoUpdate({
      target: appUser.email,
      set: { lastLoginAt: now },
    })
    .returning({ id: appUser.id });

  return rows[0]?.id ?? "";
};

export const getAuthUserById = async (id: string): Promise<AuthUserRow | null> => {
  const rows = await db()
    .select({
      id: appUser.id,
      email: appUser.email,
      createdAt: appUser.createdAt,
      lastLoginAt: appUser.lastLoginAt,
      preferences: appUser.preferences,
      name: appUser.name,
      roles: appUser.roles,
      membershipTier: appUser.membershipTier,
    })
    .from(appUser)
    .where(eq(appUser.id, id))
    .limit(1);

  if (!rows[0]) {
    return null;
  }

  return {
    ...rows[0],
    preferences: getUserPreferences(rows[0].preferences),
  };
};

export const updateAuthUserPreferences = async ({
  userId,
  preferences,
}: {
  userId: string;
  preferences: Partial<UserPreferences>;
}) => {
  await db()
    .update(appUser)
    .set({
      preferences: sql`${appUser.preferences} || ${JSON.stringify(preferences)}::jsonb`,
    })
    .where(eq(appUser.id, userId));
};

export const updateAuthUserName = async ({
  userId,
  name,
}: {
  userId: string;
  name: string | null;
}) => {
  await db().update(appUser).set({ name }).where(eq(appUser.id, userId));
};

export const updateAuthUserRoles = async ({
  userId,
  roles,
}: {
  userId: string;
  roles: string[];
}) => {
  await db().update(appUser).set({ roles }).where(eq(appUser.id, userId));
};

export const addAuthUserRole = async ({ userId, role }: { userId: string; role: string }) => {
  await db()
    .update(appUser)
    .set({ roles: sql`array_append(${appUser.roles}, ${role})` })
    .where(and(eq(appUser.id, userId), sql`NOT (${role} = ANY(${appUser.roles}))`));
};

export const removeAuthUserRole = async ({ userId, role }: { userId: string; role: string }) => {
  await db()
    .update(appUser)
    .set({ roles: sql`array_remove(${appUser.roles}, ${role})` })
    .where(eq(appUser.id, userId));
};

export const updateAuthUserMembershipTier = async ({
  userId,
  membershipTier,
}: {
  userId: string;
  membershipTier: number | null;
}) => {
  await db().update(appUser).set({ membershipTier }).where(eq(appUser.id, userId));
};

export const insertAuthToken = async ({
  jti,
  userId,
  expiresAt,
  ip,
  userAgent,
}: {
  jti: string;
  userId: string;
  expiresAt: string;
  ip: string | null;
  userAgent: string | null;
}) => {
  await db().insert(authToken).values({
    jti,
    userId,
    expiresAt,
    ip,
    userAgent,
  });
};

export const isAuthTokenActive = async (jti: string) => {
  const rows = await db()
    .select({ exists: sql<boolean>`true` })
    .from(authToken)
    .where(
      and(
        eq(authToken.jti, jti),
        isNull(authToken.revokedAt),
        gt(authToken.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);

  return rows.length > 0;
};

export const insertAuthAttempt = async ({
  userId,
  emailHash,
  emailDomain,
  outcome,
  method,
  ipHash,
  userAgentHash,
  userAgentSummary,
  requestId,
}: {
  userId?: string | null;
  emailHash: string;
  emailDomain?: string | null;
  outcome: string;
  method?: string | null;
  ipHash?: string | null;
  userAgentHash?: string | null;
  userAgentSummary?: string | null;
  requestId?: string | null;
}) => {
  await db()
    .insert(authAttempt)
    .values({
      userId: userId ?? null,
      emailHash,
      emailDomain: emailDomain ?? null,
      outcome,
      method: method ?? null,
      ipHash: ipHash ?? null,
      userAgentHash: userAgentHash ?? null,
      userAgentSummary: userAgentSummary ?? null,
      requestId: requestId ?? null,
    });
};

export const getAuthAttemptsByEmailHash = async ({
  emailHash,
  since,
  limit,
  userId,
  accountCreatedAt,
}: {
  emailHash: string;
  since: string;
  limit: number;
  userId: string;
  accountCreatedAt: string;
}) => {
  const rows = await db()
    .select({
      id: authAttempt.id,
      outcome: authAttempt.outcome,
      method: authAttempt.method,
      createdAt: authAttempt.createdAt,
      userAgentSummary: authAttempt.userAgentSummary,
    })
    .from(authAttempt)
    .where(
      and(
        eq(authAttempt.emailHash, emailHash),
        gt(authAttempt.createdAt, since),
        or(
          eq(authAttempt.userId, userId),
          and(isNull(authAttempt.userId), gt(authAttempt.createdAt, accountCreatedAt)),
        ),
      ),
    )
    .orderBy(sql`${authAttempt.createdAt} DESC`)
    .limit(limit);

  return rows;
};

export const deleteAuthChallengesByEmail = async (email: string) => {
  await db().delete(authChallenge).where(eq(authChallenge.email, email));
};

export const deleteAuthUserById = async (id: string) => {
  await db().delete(appUser).where(eq(appUser.id, id));
};

export const cleanupExpiredAuthChallenges = async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await db().delete(authChallenge).where(lt(authChallenge.expiresAt, cutoff));
};

export const maybeCleanupExpiredAuthChallenges = async () => {
  if (Math.random() < 0.05) {
    await cleanupExpiredAuthChallenges();
  }
};

interface RefreshTokenRow {
  id: string;
  tokenHash: string;
  userId: string;
  tokenFamilyId: string;
  parentId: string | null;
  issuedAt: string;
  expiresAt: string;
  revokedAt: string | null;
  usedAt: string | null;
  ip: string | null;
  userAgent: string | null;
}

export const insertRefreshToken = async ({
  tokenHash,
  userId,
  tokenFamilyId,
  parentId,
  expiresAt,
  ip,
  userAgent,
}: {
  tokenHash: string;
  userId: string;
  tokenFamilyId: string;
  parentId?: string | null;
  expiresAt: string;
  ip: string | null;
  userAgent: string | null;
}): Promise<string> => {
  const rows = await db()
    .insert(authRefreshToken)
    .values({
      tokenHash,
      userId,
      tokenFamilyId,
      parentId: parentId ?? null,
      expiresAt,
      ip,
      userAgent,
    })
    .returning({ id: authRefreshToken.id });

  return rows[0]?.id ?? "";
};

export const getRefreshTokenByHash = async (tokenHash: string): Promise<RefreshTokenRow | null> => {
  const rows = await db()
    .select({
      id: authRefreshToken.id,
      tokenHash: authRefreshToken.tokenHash,
      userId: authRefreshToken.userId,
      tokenFamilyId: authRefreshToken.tokenFamilyId,
      parentId: authRefreshToken.parentId,
      issuedAt: authRefreshToken.issuedAt,
      expiresAt: authRefreshToken.expiresAt,
      revokedAt: authRefreshToken.revokedAt,
      usedAt: authRefreshToken.usedAt,
      ip: authRefreshToken.ip,
      userAgent: authRefreshToken.userAgent,
    })
    .from(authRefreshToken)
    .where(eq(authRefreshToken.tokenHash, tokenHash))
    .limit(1);

  return rows[0] ?? null;
};

export const markRefreshTokenUsed = async (tokenHash: string) => {
  await db()
    .update(authRefreshToken)
    .set({ usedAt: new Date().toISOString() })
    .where(eq(authRefreshToken.tokenHash, tokenHash));
};

export const revokeRefreshToken = async (tokenHash: string) => {
  await db()
    .update(authRefreshToken)
    .set({ revokedAt: new Date().toISOString() })
    .where(and(eq(authRefreshToken.tokenHash, tokenHash), isNull(authRefreshToken.revokedAt)));
};

export const revokeRefreshTokenFamily = async (tokenFamilyId: string) => {
  await db()
    .update(authRefreshToken)
    .set({ revokedAt: new Date().toISOString() })
    .where(
      and(eq(authRefreshToken.tokenFamilyId, tokenFamilyId), isNull(authRefreshToken.revokedAt)),
    );
};

export const revokeAllUserRefreshTokens = async (userId: string) => {
  await db()
    .update(authRefreshToken)
    .set({ revokedAt: new Date().toISOString() })
    .where(and(eq(authRefreshToken.userId, userId), isNull(authRefreshToken.revokedAt)));
};

export const isRefreshTokenValid = async (tokenHash: string): Promise<boolean> => {
  const rows = await db()
    .select({ exists: sql<boolean>`true` })
    .from(authRefreshToken)
    .where(
      and(
        eq(authRefreshToken.tokenHash, tokenHash),
        isNull(authRefreshToken.revokedAt),
        gt(authRefreshToken.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);

  return rows.length > 0;
};

export const getActiveRefreshTokenCountByUser = async (userId: string): Promise<number> => {
  const rows = await db()
    .select({ count: count() })
    .from(authRefreshToken)
    .where(
      and(
        eq(authRefreshToken.userId, userId),
        isNull(authRefreshToken.revokedAt),
        gt(authRefreshToken.expiresAt, new Date().toISOString()),
      ),
    );

  return rows[0]?.count ?? 0;
};

export const cleanupExpiredRefreshTokens = async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  await db().delete(authRefreshToken).where(lt(authRefreshToken.expiresAt, cutoff));
};

export const maybeCleanupExpiredRefreshTokens = async () => {
  if (Math.random() < 0.01) {
    await cleanupExpiredRefreshTokens();
  }
};
