"use client";

interface BaseTokenPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  aud?: string | string[];
  iss?: string;
  jti?: string;
  typ?: string;
}

export interface AccessTokenPayload {
  sub?: BaseTokenPayload["sub"];
  exp?: BaseTokenPayload["exp"];
  iat?: BaseTokenPayload["iat"];
  aud?: BaseTokenPayload["aud"];
  iss?: BaseTokenPayload["iss"];
  jti?: BaseTokenPayload["jti"];
  typ?: string;
  rol?: string[];
  mbt?: number;
}

export interface IdTokenPayload {
  sub?: BaseTokenPayload["sub"];
  exp?: BaseTokenPayload["exp"];
  iat?: BaseTokenPayload["iat"];
  aud?: BaseTokenPayload["aud"];
  iss?: BaseTokenPayload["iss"];
  jti?: BaseTokenPayload["jti"];
  typ?: string;
  email?: string;
  name?: string | null;
  publicProfile?: boolean;
  rol?: string[];
  mbt?: number;
}

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return atob(padded);
};

const decodeJwtPayload = <T extends BaseTokenPayload>(token: string): T | null => {
  const parts = token.split(".");

  if (parts.length < 2) {
    return null;
  }

  try {
    const json = decodeBase64Url(parts[1] ?? "");

    return JSON.parse(json) as T;
  } catch {
    return null;
  }
};

export const decodeAccessToken = (token: string): AccessTokenPayload | null =>
  decodeJwtPayload<AccessTokenPayload>(token);

export const decodeIdToken = (token: string): IdTokenPayload | null =>
  decodeJwtPayload<IdTokenPayload>(token);

export const isAccessTokenValid = (token: string) => {
  const payload = decodeAccessToken(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 > Date.now();
};

export const isAccessTokenExpiringSoon = (token: string, bufferSeconds: number) => {
  const payload = decodeAccessToken(token);

  if (!payload?.exp) {
    return true;
  }

  const expiresAt = payload.exp * 1000;
  const bufferMs = bufferSeconds * 1000;

  return expiresAt - Date.now() < bufferMs;
};

export const getAccessTokenExpiresIn = (token: string): number | null => {
  const payload = decodeAccessToken(token);

  if (!payload?.exp) {
    return null;
  }

  return Math.max(0, Math.floor((payload.exp * 1000 - Date.now()) / 1000));
};
