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

const REFRESH_BUFFER_SECONDS = 120;

export function useAuthSync() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const isMountedRef = useRef(true);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  const doRefresh = useCallback(async (): Promise<string | null> => {
    if (isRefreshingRef.current || getIsLoggingOut()) {
      return null;
    }

    isRefreshingRef.current = true;

    try {
      const newToken = await refreshAccessToken();

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

  const scheduleRefresh = useCallback(
    (token: string) => {
      clearRefreshTimer();

      if (getIsLoggingOut()) {
        return;
      }

      const expiresIn = getAccessTokenExpiresIn(token);
      if (expiresIn === null || expiresIn <= REFRESH_BUFFER_SECONDS) {
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

  useEffect(() => {
    isMountedRef.current = true;
    setLoggingOut(false);

    const initAuth = async () => {
      const token = readAccessToken();

      if (token && isAccessTokenValid(token)) {
        const decoded = decodeAccessToken(token);
        dispatch(setToken({ token, decoded: decoded ?? undefined }));

        if (isAccessTokenExpiringSoon(token, REFRESH_BUFFER_SECONDS)) {
          const newToken = await doRefresh();
          if (newToken) {
            scheduleRefresh(newToken);
          }
        } else {
          scheduleRefresh(token);
        }
      } else {
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
        clearAccessToken();
        const newToken = await doRefresh();
        if (newToken) {
          scheduleRefresh(newToken);
        }
      } else if (isAccessTokenExpiringSoon(token, REFRESH_BUFFER_SECONDS)) {
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
