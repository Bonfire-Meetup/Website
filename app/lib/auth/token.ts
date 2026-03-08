"use client";

export interface AccessTokenPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  aud?: string | string[];
  iss?: string;
  jti?: string;
  typ?: string;
  rol?: string[];
  mbt?: number;
}

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return atob(padded);
};

export const decodeAccessToken = (token: string): AccessTokenPayload | null => {
  const parts = token.split(".");

  if (parts.length < 2) {
    return null;
  }

  try {
    const json = decodeBase64Url(parts[1] ?? "");

    return JSON.parse(json) as AccessTokenPayload;
  } catch {
    return null;
  }
};

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
