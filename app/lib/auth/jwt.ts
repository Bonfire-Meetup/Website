import crypto from "crypto";

import { SignJWT, importPKCS8, importSPKI, jwtVerify } from "jose";

import { serverEnv } from "@/lib/config/env";
import { isAuthTokenActive } from "@/lib/data/auth";

const getJwtIssuer = () => serverEnv.BNF_JWT_ISSUER;

const getJwtAudience = () => serverEnv.BNF_JWT_AUDIENCE;

const normalizePem = (pem: string): string => {
  if (pem.includes("\n")) {
    return pem;
  }

  return pem
    .replace(/(-----BEGIN [A-Z ]+-----)/, "$1\n")
    .replace(/(-----END [A-Z ]+-----)/, "\n$1");
};

const getJwtPrivateKey = () => normalizePem(serverEnv.BNF_JWT_PRIVATE_KEY);

const getJwtPublicKey = () => normalizePem(serverEnv.BNF_JWT_PUBLIC_KEY);

const getJwtKeyId = () => serverEnv.BNF_JWT_KEY_ID ?? "bnf-auth";

// Token TTL configuration
// Access token: Short-lived for security (15 minutes)
const accessTokenTtlSeconds = 15 * 60;

// Refresh token: Long-lived for UX (30 days)
const refreshTokenTtlSeconds = 30 * 24 * 60 * 60;

// Grace period for concurrent refresh requests (seconds)
const refreshTokenReuseWindowSeconds = 10;

export const getAccessTokenTtlSeconds = () => accessTokenTtlSeconds;

export const getRefreshTokenTtlSeconds = () => refreshTokenTtlSeconds;

export const getRefreshTokenReuseWindowSeconds = () => refreshTokenReuseWindowSeconds;

export const signAccessToken = async (userId: string, jti: string) => {
  const privateKey = await importPKCS8(getJwtPrivateKey(), "EdDSA");

  return new SignJWT({ typ: "access" })
    .setProtectedHeader({ alg: "EdDSA", kid: getJwtKeyId(), typ: "JWT" })
    .setIssuer(getJwtIssuer())
    .setAudience(getJwtAudience())
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${accessTokenTtlSeconds}s`)
    .setJti(jti)
    .sign(privateKey);
};

export const verifyAccessToken = async (token: string) => {
  const publicKey = await importSPKI(getJwtPublicKey(), "EdDSA");
  const { payload } = await jwtVerify(token, publicKey, {
    audience: getJwtAudience(),
    issuer: getJwtIssuer(),
  });

  if (typeof payload.sub !== "string") {
    throw new Error("Invalid token subject");
  }

  if (typeof payload.jti !== "string") {
    throw new Error("Invalid token id");
  }

  const isActive = await isAuthTokenActive(payload.jti);

  if (!isActive) {
    throw new Error("Token revoked");
  }

  return payload;
};

// Refresh token cookie configuration
export const REFRESH_TOKEN_COOKIE_NAME = "bnf_refresh_token";

export const getRefreshTokenCookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/api/v1/auth",
  maxAge: maxAge ?? refreshTokenTtlSeconds,
});

// Refresh token generation and hashing
// We store only the hash in the database for security
const REFRESH_TOKEN_BYTES = 32;

/**
 * Generate a cryptographically secure random refresh token.
 * Returns a URL-safe base64 encoded string.
 */
export const generateRefreshToken = (): string => {
  const buffer = crypto.randomBytes(REFRESH_TOKEN_BYTES);
  return buffer.toString("base64url");
};

/**
 * Hash a refresh token for secure storage in the database.
 * Uses SHA-256 to create a one-way hash.
 */
export const hashRefreshToken = (token: string): string =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Validate refresh token format (base64url, correct length).
 */
export const isValidRefreshTokenFormat = (token: string): boolean => {
  // Base64url encoded 32 bytes = 43 characters
  if (token.length !== 43) {
    return false;
  }
  // Check if it's valid base64url
  return /^[A-Za-z0-9_-]+$/.test(token);
};
