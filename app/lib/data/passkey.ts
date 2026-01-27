import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";

import { getDatabaseClient } from "@/lib/data/db";

export interface PasskeyRow {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_type: string | null;
  backed_up: boolean;
  transports: string[] | null;
  name: string | null;
  created_at: Date;
  last_used_at: Date | null;
}

export interface PasskeyChallengeRow {
  id: string;
  user_id: string | null;
  challenge: string;
  type: string;
  expires_at: Date;
  used_at: Date | null;
  created_at: Date;
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
  const sql = getDatabaseClient();
  const rows = (await sql`
    INSERT INTO auth_passkey (user_id, credential_id, public_key, counter, device_type, backed_up, transports, name)
    VALUES (${userId}, ${credentialId}, ${publicKey}, ${counter}, ${deviceType ?? null}, ${backedUp ?? false}, ${transports ?? null}, ${name ?? null})
    RETURNING id
  `) as { id: string }[];

  return rows[0]?.id ?? null;
};

export const getPasskeysByUserId = async (userId: string): Promise<PasskeyRow[]> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, user_id, credential_id, public_key, counter, device_type, backed_up, transports, name, created_at, last_used_at
    FROM auth_passkey
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `) as PasskeyRow[];

  return rows;
};

export const getPasskeyByCredentialId = async (
  credentialId: string,
): Promise<PasskeyRow | null> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, user_id, credential_id, public_key, counter, device_type, backed_up, transports, name, created_at, last_used_at
    FROM auth_passkey
    WHERE credential_id = ${credentialId}
    LIMIT 1
  `) as PasskeyRow[];

  return rows[0] ?? null;
};

export const getPasskeyById = async (id: string): Promise<PasskeyRow | null> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, user_id, credential_id, public_key, counter, device_type, backed_up, transports, name, created_at, last_used_at
    FROM auth_passkey
    WHERE id = ${id}
    LIMIT 1
  `) as PasskeyRow[];

  return rows[0] ?? null;
};

export const updatePasskeyCounter = async (credentialId: string, counter: number) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE auth_passkey
    SET counter = ${counter}, last_used_at = now()
    WHERE credential_id = ${credentialId}
  `;
};

export const updatePasskeyName = async (id: string, userId: string, name: string | null) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE auth_passkey
    SET name = ${name}
    WHERE id = ${id} AND user_id = ${userId}
  `;
};

export const deletePasskey = async (id: string, userId: string): Promise<boolean> => {
  const sql = getDatabaseClient();
  const result = (await sql`
    DELETE FROM auth_passkey
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `) as { id: string }[];

  return result.length > 0;
};

export const getPasskeyCountByUserId = async (userId: string): Promise<number> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT count(*)::int as count
    FROM auth_passkey
    WHERE user_id = ${userId}
  `) as { count: number }[];

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
  const sql = getDatabaseClient();
  const rows = (await sql`
    INSERT INTO auth_passkey_challenge (user_id, challenge, type, expires_at)
    VALUES (${userId ?? null}, ${challenge}, ${type}, ${expiresAt})
    RETURNING id
  `) as { id: string }[];

  return rows[0]?.id ?? null;
};

export const getPasskeyChallenge = async (
  challenge: string,
  type: "registration" | "authentication",
): Promise<PasskeyChallengeRow | null> => {
  const sql = getDatabaseClient();
  const rows = (await sql`
    SELECT id, user_id, challenge, type, expires_at, used_at, created_at
    FROM auth_passkey_challenge
    WHERE challenge = ${challenge}
      AND type = ${type}
      AND used_at IS NULL
      AND expires_at > now()
    LIMIT 1
  `) as PasskeyChallengeRow[];

  return rows[0] ?? null;
};

export const markPasskeyChallengeUsed = async (id: string) => {
  const sql = getDatabaseClient();
  await sql`
    UPDATE auth_passkey_challenge
    SET used_at = now()
    WHERE id = ${id}
  `;
};

export const cleanupExpiredPasskeyChallenges = async () => {
  const sql = getDatabaseClient();
  await sql`
    DELETE FROM auth_passkey_challenge
    WHERE expires_at < now() - INTERVAL '1 hour'
  `;
};

export const maybeCleanupExpiredPasskeyChallenges = async () => {
  if (Math.random() < 0.05) {
    await cleanupExpiredPasskeyChallenges();
  }
};
