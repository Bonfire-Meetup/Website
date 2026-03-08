import "server-only";

import crypto from "crypto";

import {
  generateRefreshToken,
  getAccessTokenTtlSeconds,
  getRefreshTokenCookieOptions,
  getRefreshTokenTtlSeconds,
  hashRefreshToken,
  REFRESH_TOKEN_COOKIE_NAME,
  signAccessToken,
  signIdToken,
} from "@/lib/auth/jwt";
import { getAuthUserById, insertAuthToken, insertRefreshToken } from "@/lib/data/auth";

export interface IssuedAuthTokens {
  accessToken: string;
  accessExpiresIn: number;
  accessTokenJti: string;
  cookieValue: string;
  idToken: string;
}

export async function issueAuthTokens({
  ip,
  parentId,
  tokenFamilyId,
  userAgent,
  userId,
}: {
  ip: string | null;
  parentId: string | null;
  tokenFamilyId: string;
  userAgent: string | null;
  userId: string;
}): Promise<IssuedAuthTokens> {
  const user = await getAuthUserById(userId);
  const roles = user?.roles ?? [];
  const membershipTier = user?.membershipTier ?? null;
  const publicProfile = user?.preferences.publicProfile ?? false;
  const userEmail = user?.email ?? "";
  const userName = user?.name ?? null;

  const accessTokenJti = crypto.randomUUID();
  const accessToken = await signAccessToken(userId, accessTokenJti, roles, membershipTier);
  const idToken = await signIdToken({
    email: userEmail,
    jti: crypto.randomUUID(),
    membershipTier,
    name: userName,
    publicProfile,
    roles,
    userId,
  });

  const accessExpiresIn = getAccessTokenTtlSeconds();
  const accessExpiresAt = new Date(Date.now() + accessExpiresIn * 1000).toISOString();

  await insertAuthToken({
    expiresAt: accessExpiresAt,
    ip,
    jti: accessTokenJti,
    userAgent,
    userId,
  });

  const refreshToken = generateRefreshToken();
  const refreshTokenHash = hashRefreshToken(refreshToken);
  const refreshExpiresIn = getRefreshTokenTtlSeconds();
  const refreshExpiresAt = new Date(Date.now() + refreshExpiresIn * 1000).toISOString();

  await insertRefreshToken({
    expiresAt: refreshExpiresAt,
    ip,
    tokenHash: refreshTokenHash,
    parentId,
    tokenFamilyId,
    userAgent,
    userId,
  });

  const cookieOptions = getRefreshTokenCookieOptions(refreshExpiresIn);
  const cookieValue = `${REFRESH_TOKEN_COOKIE_NAME}=${refreshToken}; HttpOnly; ${cookieOptions.secure ? "Secure; " : ""}SameSite=${cookieOptions.sameSite}; Path=${cookieOptions.path}; Max-Age=${cookieOptions.maxAge}`;

  return {
    accessToken,
    accessExpiresIn,
    accessTokenJti,
    cookieValue,
    idToken,
  };
}
