"use client";

import { STORAGE_KEYS } from "../storage/keys";

export interface AccessTokenPayload {
  sub?: string;
  exp?: number;
  iat?: number;
  aud?: string | string[];
  iss?: string;
  jti?: string;
  typ?: string;
  rol?: string[];
}

const accessTokenStorageKey = STORAGE_KEYS.ACCESS_TOKEN;

const TOKEN_REFRESH_BUFFER_SECONDS = 120;

let refreshPromise: Promise<string | null> | null = null;

let isLoggingOut = false;

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

export const getIsLoggingOut = () => isLoggingOut;

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

export const getHasValidToken = (): boolean => {
  const token = readAccessToken();
  return token ? isAccessTokenValid(token) : false;
};

export const isAccessTokenExpiringSoon = (
  token: string,
  bufferSeconds = TOKEN_REFRESH_BUFFER_SECONDS,
) => {
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

/**
 * Refresh the access token using the httpOnly refresh token cookie.
 * Returns the new access token or null if refresh failed.
 * Handles concurrent refresh requests by reusing the same promise.
 */
export const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch("/api/v1/auth/token", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ grant_type: "refresh_token" }),
      });

      if (!response.ok) {
        clearAccessToken();

        return null;
      }

      const data = (await response.json()) as { access_token: string };
      const newToken = data.access_token;

      if (newToken) {
        writeAccessToken(newToken);

        return newToken;
      }

      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export const getValidAccessToken = (): Promise<string | null> => {
  const token = readAccessToken();

  if (!token) {
    return refreshAccessToken();
  }

  if (isAccessTokenValid(token) && !isAccessTokenExpiringSoon(token)) {
    return Promise.resolve(token);
  }

  return refreshAccessToken();
};

export const revokeSession = async (options?: { revokeAll?: boolean; revokeFamily?: boolean }) => {
  setLoggingOut(true);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // If revoking all sessions, we need to include the access token
  if (options?.revokeAll) {
    const token = readAccessToken();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    await fetch("/api/v1/auth/revoke", {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({
        revoke_all: options?.revokeAll ?? false,
        revoke_family: options?.revokeFamily ?? false,
      }),
    });
  } catch {
    // Ignore errors during revocation
  } finally {
    clearAccessToken();
  }
};
