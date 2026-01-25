"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  clearAccessToken,
  decodeAccessToken,
  getConsecutiveFailures,
  getIsLoggingOut,
  hasDeviceWoken,
  isAccessTokenExpiringSoon,
  isAccessTokenValid,
  isCircuitOpen,
  onTokenRefreshed,
  readAccessToken,
  refreshAccessToken,
  setLoggingOut,
  updateLastActivity,
  writeAccessToken,
} from "@/lib/auth/client";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearAuth, setToken } from "@/lib/redux/slices/authSlice";

const REFRESH_BUFFER_SECONDS = 120;
const BASE_CHECK_INTERVAL_MS = 15000;
const WAKE_DETECTION_THRESHOLD_MS = 30000;

const getAdaptiveInterval = (): number => {
  const failures = getConsecutiveFailures();
  if (failures > 0) {
    return Math.min(BASE_CHECK_INTERVAL_MS * 2 ** failures, 300000);
  }
  return BASE_CHECK_INTERVAL_MS;
};

export function useAuthSync() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);
  const isMountedRef = useRef(true);
  const isPageVisibleRef = useRef(true);

  const performRefresh = useCallback(async (): Promise<string | null> => {
    if (isRefreshingRef.current || getIsLoggingOut() || isCircuitOpen()) {
      return null;
    }

    isRefreshingRef.current = true;

    try {
      const newToken = await refreshAccessToken();

      if (!isMountedRef.current || getIsLoggingOut()) {
        return null;
      }

      return newToken;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  const checkAndRefreshToken = useCallback(async () => {
    if (getIsLoggingOut() || !isMountedRef.current) {
      return;
    }

    const deviceWoken = hasDeviceWoken(WAKE_DETECTION_THRESHOLD_MS);

    const token = readAccessToken();

    if (!token) {
      if (deviceWoken) {
        await performRefresh();
      }
      return;
    }

    if (!isAccessTokenValid(token)) {
      await performRefresh();
      return;
    }

    if (isAccessTokenExpiringSoon(token, REFRESH_BUFFER_SECONDS) || deviceWoken) {
      await performRefresh();
    }
  }, [performRefresh]);

  const startTokenCheckInterval = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
    }

    checkIntervalRef.current = setInterval(() => {
      if (!isPageVisibleRef.current) {
        return;
      }
      updateLastActivity();
      checkAndRefreshToken();
    }, getAdaptiveInterval());
  }, [checkAndRefreshToken]);

  const stopTokenCheckInterval = useCallback(() => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current);
      checkIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    setLoggingOut(false);
    updateLastActivity();

    const initAuth = async () => {
      const token = readAccessToken();

      if (token && isAccessTokenValid(token)) {
        const decoded = decodeAccessToken(token);
        dispatch(setToken({ token, decoded: decoded ?? undefined }));

        if (isAccessTokenExpiringSoon(token, REFRESH_BUFFER_SECONDS)) {
          await performRefresh();
        }
      } else {
        if (token) {
          clearAccessToken();
        }
        await performRefresh();
      }

      startTokenCheckInterval();
    };

    initAuth();

    return () => {
      isMountedRef.current = false;
      stopTokenCheckInterval();
    };
  }, [dispatch, performRefresh, startTokenCheckInterval, stopTokenCheckInterval]);

  useEffect(() => {
    if (!auth.hydrated) {
      return;
    }

    if (auth.token) {
      writeAccessToken(auth.token);
    } else if (!auth.isAuthenticated) {
      clearAccessToken();
    }
  }, [auth.token, auth.isAuthenticated, auth.hydrated]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = document.visibilityState === "visible";
      isPageVisibleRef.current = isVisible;

      if (isVisible) {
        updateLastActivity();
        startTokenCheckInterval();
        checkAndRefreshToken();
      } else {
        stopTokenCheckInterval();
      }
    };

    const handleFocus = () => {
      updateLastActivity();
      checkAndRefreshToken();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [checkAndRefreshToken, startTokenCheckInterval, stopTokenCheckInterval]);

  useEffect(() => {
    const unsubscribe = onTokenRefreshed((newToken) => {
      if (!isMountedRef.current) {
        return;
      }

      if (newToken) {
        const decoded = decodeAccessToken(newToken);
        dispatch(setToken({ token: newToken, decoded: decoded ?? undefined }));
      } else {
        dispatch(clearAuth());
      }
    });

    return unsubscribe;
  }, [dispatch]);

  return auth;
}
