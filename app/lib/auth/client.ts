"use client";

import { STORAGE_KEYS } from "../storage/keys";

export interface AccessTokenPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  aud?: string | string[];
  iss?: string;
  jti?: string;
}

const accessTokenStorageKey = STORAGE_KEYS.ACCESS_TOKEN;

const decodeBase64Url = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

  return atob(padded);
};

export const readAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(accessTokenStorageKey);
};

export const writeAccessToken = (token: string) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(accessTokenStorageKey, token);
};

export const clearAccessToken = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(accessTokenStorageKey);
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
