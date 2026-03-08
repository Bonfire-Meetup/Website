"use client";

import { API_ROUTES } from "@/lib/api/routes";
import { store } from "@/lib/redux/store";
import { logWarn } from "@/lib/utils/log-client";

import { STORAGE_KEYS } from "../storage/keys";

import {
  decodeAccessToken,
  getAccessTokenExpiresIn,
  isAccessTokenExpiringSoon,
  isAccessTokenValid,
  type AccessTokenPayload,
} from "./token";

const accessTokenStorageKey = STORAGE_KEYS.ACCESS_TOKEN;

const TOKEN_REFRESH_BUFFER_SECONDS = 120;

let refreshPromise: Promise<string | null> | null = null;

let isLoggingOut = false;

let lastActivityTimestamp = Date.now();

let consecutiveFailures = 0;
let lastFailureTimestamp = 0;

const MAX_CONSECUTIVE_FAILURES = 3;
const CIRCUIT_RESET_MS = 60000;

type RefreshListener = (token: string | null) => void;
const refreshListeners = new Set<RefreshListener>();

export const onTokenRefreshed = (listener: RefreshListener): (() => void) => {
  refreshListeners.add(listener);
  return () => refreshListeners.delete(listener);
};

const notifyTokenRefreshed = (token: string | null) => {
  refreshListeners.forEach((listener) => listener(token));
};

export const updateLastActivity = () => {
  lastActivityTimestamp = Date.now();
};

export const getLastActivity = () => lastActivityTimestamp;

export const hasDeviceWoken = (thresholdMs = 5000): boolean => {
  const timeSinceLastActivity = Date.now() - lastActivityTimestamp;
  const hasWoken = timeSinceLastActivity > thresholdMs;
  if (hasWoken) {
    updateLastActivity();
  }
  return hasWoken;
};

export const getConsecutiveFailures = () => consecutiveFailures;

export const isCircuitOpen = () => {
  if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
    if (Date.now() - lastFailureTimestamp > CIRCUIT_RESET_MS) {
      consecutiveFailures = 0;
      return false;
    }
    return true;
  }
  return false;
};

export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

export const getIsLoggingOut = () => isLoggingOut;

const readPersistedAccessToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(accessTokenStorageKey);
};

export const readAccessToken = () => {
  const state = store.getState();
  const reduxToken = state.auth.token;

  if (reduxToken) {
    return reduxToken;
  }

  return readPersistedAccessToken();
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

export const getHasValidToken = (): boolean => {
  const token = readAccessToken();
  return token ? isAccessTokenValid(token) : false;
};

export const refreshAccessToken = (): Promise<string | null> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  if (isCircuitOpen()) {
    return Promise.resolve(null);
  }

  updateLastActivity();

  const performRefresh = async () => {
    const existingToken = readAccessToken();
    if (
      existingToken &&
      isAccessTokenValid(existingToken) &&
      !isAccessTokenExpiringSoon(existingToken, TOKEN_REFRESH_BUFFER_SECONDS)
    ) {
      return existingToken;
    }

    try {
      const response = await fetch(API_ROUTES.AUTH.TOKEN, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ grant_type: "refresh_token" }),
      });

      if (!response.ok) {
        consecutiveFailures++;
        lastFailureTimestamp = Date.now();

        if (response.status === 401) {
          clearAccessToken();
          notifyTokenRefreshed(null);
        }

        return null;
      }

      const data = (await response.json()) as { access_token: string };
      const newToken = data.access_token;

      if (newToken) {
        consecutiveFailures = 0;
        writeAccessToken(newToken);
        notifyTokenRefreshed(newToken);
        return newToken;
      }

      consecutiveFailures++;
      lastFailureTimestamp = Date.now();
      return null;
    } catch {
      consecutiveFailures++;
      lastFailureTimestamp = Date.now();
      return null;
    }
  };

  refreshPromise = (async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.locks) {
        return await navigator.locks.request("bnf_auth_refresh", performRefresh);
      }
      return await performRefresh();
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

  if (
    isAccessTokenValid(token) &&
    !isAccessTokenExpiringSoon(token, TOKEN_REFRESH_BUFFER_SECONDS)
  ) {
    return Promise.resolve(token);
  }

  return refreshAccessToken();
};

export {
  decodeAccessToken,
  getAccessTokenExpiresIn,
  isAccessTokenExpiringSoon,
  isAccessTokenValid,
};
export type { AccessTokenPayload };

export const revokeSession = async (options?: { revokeAll?: boolean; revokeFamily?: boolean }) => {
  setLoggingOut(true);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.revokeAll) {
    const token = readAccessToken();

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    await fetch(API_ROUTES.AUTH.REVOKE, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify({
        revoke_all: options?.revokeAll ?? false,
        revoke_family: options?.revokeFamily ?? false,
      }),
    });
  } catch (error) {
    logWarn("auth.revoke_session_failed", { error: String(error) });
  } finally {
    clearAccessToken();
  }
};
