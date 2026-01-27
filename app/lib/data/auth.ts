import { getDatabaseClient } from "@/lib/data/db";

interface AuthChallengeRow {
  id: string;
  code_hash: string;
  attempts: number;
  max_attempts: number;
  expires_at: Date;
}

type AuthChallengeStatusRow = AuthChallengeRow & {
  used_at: Date | null;
};

interface UserPreferences {
  allowCommunityEmails?: boolean;
  publicProfile?: boolean;
}

interface AuthUserRow {
  id: string;
  email: string;
  created_at: Date;
  last_login_at: Date | null;
  preferences: UserPreferences;
  name: string | null;
  roles: string[];
  membership_tier: number | null;
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
  expiresAt: Date;
  maxAttempts: number;
  ip: string | null;
  userAgent: string | null;
}) => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    INSERT INTO auth_challenge (challenge_token_hash, email, code_hash, expires_at, max_attempts, ip, user_agent)
    VALUES (${challengeTokenHash}, ${email}, ${codeHash}, ${expiresAt}, ${maxAttempts}, ${ip}, ${userAgent})
    RETURNING id
  `) as { id: string }[];

  return rows[0]?.id ?? null;
};

export const getActiveChallengeByToken = async (
  challengeTokenHash: string,
  email: string,
): Promise<AuthChallengeRow | null> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, code_hash, attempts, max_attempts, expires_at
    FROM auth_challenge
    WHERE challenge_token_hash = ${challengeTokenHash}
      AND email = ${email}
      AND used_at IS NULL
      AND expires_at > now()
    LIMIT 1
  `) as AuthChallengeRow[];

  return rows[0] ?? null;
};

export const getChallengeByToken = async (
  challengeTokenHash: string,
  email: string,
): Promise<AuthChallengeStatusRow | null> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, code_hash, attempts, max_attempts, expires_at, used_at
    FROM auth_challenge
    WHERE challenge_token_hash = ${challengeTokenHash}
      AND email = ${email}
    ORDER BY created_at DESC
    LIMIT 1
  `) as AuthChallengeStatusRow[];

  return rows[0] ?? null;
};

export const incrementAuthChallengeAttempts = async (id: string) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE auth_challenge
    SET attempts = attempts + 1
    WHERE id = ${id}
  `;
};

export const markAuthChallengeUsed = async (id: string) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE auth_challenge
    SET used_at = now()
    WHERE id = ${id}
  `;
};

export const upsertAuthUser = async (email: string): Promise<string> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    INSERT INTO app_user (email, last_login_at)
    VALUES (${email}, now())
    ON CONFLICT (email)
    DO UPDATE SET last_login_at = now()
    RETURNING id
  `) as { id: string }[];

  return rows[0]?.id ?? "";
};

export const getAuthUserById = async (id: string): Promise<AuthUserRow | null> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, email, created_at, last_login_at, preferences, name, roles, membership_tier
    FROM app_user
    WHERE id = ${id}
    LIMIT 1
  `) as (Omit<AuthUserRow, "preferences"> & { preferences: unknown })[];

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
  const sql = getDatabaseClient();
  await sql`
    UPDATE app_user
    SET preferences = preferences || ${JSON.stringify(preferences)}::jsonb
    WHERE id = ${userId}
  `;
};

export const updateAuthUserName = async ({
  userId,
  name,
}: {
  userId: string;
  name: string | null;
}) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE app_user
    SET name = ${name}
    WHERE id = ${userId}
  `;
};

export const updateAuthUserRoles = async ({
  userId,
  roles,
}: {
  userId: string;
  roles: string[];
}) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE app_user
    SET roles = ${roles}
    WHERE id = ${userId}
  `;
};

export const addAuthUserRole = async ({ userId, role }: { userId: string; role: string }) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE app_user
    SET roles = array_append(roles, ${role})
    WHERE id = ${userId}
      AND NOT (${role} = ANY(roles))
  `;
};

export const removeAuthUserRole = async ({ userId, role }: { userId: string; role: string }) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE app_user
    SET roles = array_remove(roles, ${role})
    WHERE id = ${userId}
  `;
};

export const updateAuthUserMembershipTier = async ({
  userId,
  membershipTier,
}: {
  userId: string;
  membershipTier: number | null;
}) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE app_user
    SET membership_tier = ${membershipTier}
    WHERE id = ${userId}
  `;
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
  expiresAt: Date;
  ip: string | null;
  userAgent: string | null;
}) => {
  const sql = getDatabaseClient();
  await sql`
    INSERT INTO auth_token (jti, user_id, expires_at, ip, user_agent)
    VALUES (${jti}, ${userId}, ${expiresAt}, ${ip}, ${userAgent})
  `;
};

export const isAuthTokenActive = async (jti: string) => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT exists(
      SELECT 1
      FROM auth_token
      WHERE jti = ${jti} AND revoked_at IS NULL AND expires_at > now()
    ) as exists
  `) as { exists: boolean }[];

  return rows[0]?.exists ?? false;
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
  const sql = getDatabaseClient();
  await sql`
    INSERT INTO auth_attempt (user_id, email_hash, email_domain, outcome, method, ip_hash, user_agent_hash, user_agent_summary, request_id)
    VALUES (${userId ?? null}, ${emailHash}, ${emailDomain ?? null}, ${outcome}, ${method ?? null}, ${ipHash ?? null}, ${userAgentHash ?? null}, ${userAgentSummary ?? null}, ${requestId ?? null})
  `;
};

export const getAuthAttemptsByEmailHash = async ({
  emailHash,
  since,
  limit,
  userId,
  accountCreatedAt,
}: {
  emailHash: string;
  since: Date;
  limit: number;
  userId: string;
  accountCreatedAt: Date;
}) => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, outcome, method, created_at, user_agent_summary
    FROM auth_attempt
    WHERE email_hash = ${emailHash}
      AND created_at >= ${since}
      AND (
        user_id = ${userId}
        OR (user_id IS NULL AND created_at >= ${accountCreatedAt})
      )
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as {
    id: string;
    outcome: string;
    method: string | null;
    created_at: Date;
    user_agent_summary: string | null;
  }[];

  return rows;
};

export const deleteAuthChallengesByEmail = async (email: string) => {
  const sql = getDatabaseClient();
  await sql`
    DELETE FROM auth_challenge
    WHERE email = ${email}
  `;
};

export const deleteAuthUserById = async (id: string) => {
  const sql = getDatabaseClient();
  await sql`
    DELETE FROM app_user
    WHERE id = ${id}
  `;
};

interface RefreshTokenRow {
  id: string;
  token_hash: string;
  user_id: string;
  token_family_id: string;
  parent_id: string | null;
  issued_at: Date;
  expires_at: Date;
  revoked_at: Date | null;
  used_at: Date | null;
  ip: string | null;
  user_agent: string | null;
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
  expiresAt: Date;
  ip: string | null;
  userAgent: string | null;
}): Promise<string> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    INSERT INTO auth_refresh_token (token_hash, user_id, token_family_id, parent_id, expires_at, ip, user_agent)
    VALUES (${tokenHash}, ${userId}, ${tokenFamilyId}, ${parentId ?? null}, ${expiresAt}, ${ip}, ${userAgent})
    RETURNING id
  `) as { id: string }[];

  return rows[0]?.id ?? "";
};

export const getRefreshTokenByHash = async (tokenHash: string): Promise<RefreshTokenRow | null> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, token_hash, user_id, token_family_id, parent_id, issued_at, expires_at, revoked_at, used_at, ip, user_agent
    FROM auth_refresh_token
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `) as RefreshTokenRow[];

  return rows[0] ?? null;
};

export const markRefreshTokenUsed = async (tokenHash: string) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE auth_refresh_token
    SET used_at = now()
    WHERE token_hash = ${tokenHash}
  `;
};

export const revokeRefreshToken = async (tokenHash: string) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE auth_refresh_token
    SET revoked_at = now()
    WHERE token_hash = ${tokenHash} AND revoked_at IS NULL
  `;
};

export const revokeRefreshTokenFamily = async (tokenFamilyId: string) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE auth_refresh_token
    SET revoked_at = now()
    WHERE token_family_id = ${tokenFamilyId} AND revoked_at IS NULL
  `;
};

export const revokeAllUserRefreshTokens = async (userId: string) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE auth_refresh_token
    SET revoked_at = now()
    WHERE user_id = ${userId} AND revoked_at IS NULL
  `;
};

export const isRefreshTokenValid = async (tokenHash: string): Promise<boolean> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT exists(
      SELECT 1
      FROM auth_refresh_token
      WHERE token_hash = ${tokenHash} AND revoked_at IS NULL AND expires_at > now()
    ) as exists
  `) as { exists: boolean }[];

  return rows[0]?.exists ?? false;
};

export const getActiveRefreshTokenCountByUser = async (userId: string): Promise<number> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT count(*)::int as count
    FROM auth_refresh_token
    WHERE user_id = ${userId} AND revoked_at IS NULL AND expires_at > now()
  `) as { count: number }[];

  return rows[0]?.count ?? 0;
};

export const cleanupExpiredRefreshTokens = async () => {
  const sql = getDatabaseClient();
  await sql`
    DELETE FROM auth_refresh_token
    WHERE expires_at < now() - INTERVAL '7 days'
  `;
};

export const maybeCleanupExpiredRefreshTokens = async () => {
  if (Math.random() < 0.01) {
    await cleanupExpiredRefreshTokens();
  }
};
