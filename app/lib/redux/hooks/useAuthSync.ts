"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  clearAccessToken,
  decodeAccessToken,
  getAccessTokenExpiresIn,
  getIsLoggingOut,
  isAccessTokenExpiringSoon,
  isAccessTokenValid,
  readAccessToken,
  refreshAccessToken,
  setLoggingOut,
  writeAccessToken,
} from "@/lib/auth/client";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearAuth, setToken } from "@/lib/redux/slices/authSlice";

// Refresh token 2 minutes before expiry
const REFRESH_BUFFER_SECONDS = 120;

export function useAuthSync() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const isMountedRef = useRef(true);

  // Clear any existing refresh timer
  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Perform token refresh
  const doRefresh = useCallback(async (): Promise<string | null> => {
    if (isRefreshingRef.current || getIsLoggingOut()) {
      return null;
    }

    isRefreshingRef.current = true;

    try {
      const newToken = await refreshAccessToken();

      // Check flags again after async operation
      if (!isMountedRef.current || getIsLoggingOut()) {
        return null;
      }

      if (newToken) {
        const decoded = decodeAccessToken(newToken);
        dispatch(setToken({ token: newToken, decoded: decoded ?? undefined }));
        return newToken;
      }
      dispatch(clearAuth());
      return null;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [dispatch]);

  // Schedule a token refresh before expiry
  const scheduleRefresh = useCallback(
    (token: string) => {
      clearRefreshTimer();

      if (getIsLoggingOut()) {
        return;
      }

      const expiresIn = getAccessTokenExpiresIn(token);
      if (expiresIn === null || expiresIn <= REFRESH_BUFFER_SECONDS) {
        // Token already expired or expiring very soon
        return;
      }

      const refreshIn = (expiresIn - REFRESH_BUFFER_SECONDS) * 1000;

      refreshTimerRef.current = setTimeout(async () => {
        const newToken = await doRefresh();
        if (newToken) {
          scheduleRefresh(newToken);
        }
      }, refreshIn);
    },
    [clearRefreshTimer, doRefresh],
  );

  // Initialize auth state on mount
  useEffect(() => {
    isMountedRef.current = true;
    setLoggingOut(false);

    const initAuth = async () => {
      const token = readAccessToken();

      if (token && isAccessTokenValid(token)) {
        // Valid token in localStorage
        const decoded = decodeAccessToken(token);
        dispatch(setToken({ token, decoded: decoded ?? undefined }));

        if (isAccessTokenExpiringSoon(token, REFRESH_BUFFER_SECONDS)) {
          // Expiring soon - refresh now
          const newToken = await doRefresh();
          if (newToken) {
            scheduleRefresh(newToken);
          }
        } else {
          scheduleRefresh(token);
        }
      } else {
        // No valid token - try refresh (user might have httpOnly cookie)
        if (token) {
          clearAccessToken();
        }
        const newToken = await doRefresh();
        if (newToken) {
          scheduleRefresh(newToken);
        }
      }
    };

    initAuth();

    return () => {
      isMountedRef.current = false;
      clearRefreshTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync Redux state changes to localStorage
  useEffect(() => {
    if (!auth.hydrated) {
      return;
    }

    if (auth.token) {
      writeAccessToken(auth.token);
    } else if (!auth.isAuthenticated) {
      clearAccessToken();
      clearRefreshTimer();
    }
  }, [auth.token, auth.isAuthenticated, auth.hydrated, clearRefreshTimer]);

  // Handle tab visibility - refresh stale tokens when user returns
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "visible" || getIsLoggingOut()) {
        return;
      }

      const token = readAccessToken();
      if (!token) {
        return;
      }

      if (!isAccessTokenValid(token)) {
        // Token expired while tab was hidden
        clearAccessToken();
        const newToken = await doRefresh();
        if (newToken) {
          scheduleRefresh(newToken);
        }
      } else if (isAccessTokenExpiringSoon(token, REFRESH_BUFFER_SECONDS)) {
        // Token expiring soon
        const newToken = await doRefresh();
        if (newToken) {
          scheduleRefresh(newToken);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [doRefresh, scheduleRefresh]);

  return auth;
}
