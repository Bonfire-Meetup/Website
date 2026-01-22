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

interface AuthUserRow {
  id: string;
  email: string;
  created_at: Date;
  last_login_at: Date | null;
  allow_community_emails: boolean;
}

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
    SELECT id, email, created_at, last_login_at, allow_community_emails
    FROM app_user
    WHERE id = ${id}
    LIMIT 1
  `) as AuthUserRow[];
  return rows[0] ?? null;
};

export const updateAuthUserCommunityEmails = async ({
  userId,
  allowCommunityEmails,
}: {
  userId: string;
  allowCommunityEmails: boolean;
}) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE app_user
    SET allow_community_emails = ${allowCommunityEmails}
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
  ipHash,
  userAgentHash,
  requestId,
}: {
  userId?: string | null;
  emailHash: string;
  emailDomain?: string | null;
  outcome: string;
  ipHash?: string | null;
  userAgentHash?: string | null;
  requestId?: string | null;
}) => {
  const sql = getDatabaseClient();
  await sql`
    INSERT INTO auth_attempt (user_id, email_hash, email_domain, outcome, ip_hash, user_agent_hash, request_id)
    VALUES (${userId ?? null}, ${emailHash}, ${emailDomain ?? null}, ${outcome}, ${ipHash ?? null}, ${userAgentHash ?? null}, ${requestId ?? null})
  `;
};

export const getAuthAttemptsByEmailHash = async ({
  emailHash,
  since,
  limit,
}: {
  emailHash: string;
  since: Date;
  limit: number;
}) => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, outcome, created_at
    FROM auth_attempt
    WHERE email_hash = ${emailHash} AND created_at >= ${since}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `) as { id: string; outcome: string; created_at: Date }[];
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
