"use client";

import { useCallback, useEffect, useRef } from "react";

import {
  clearAccessToken,
  decodeAccessToken,
  decodeIdToken,
  getAccessTokenExpiresIn,
  getConsecutiveFailures,
  getIsLoggingOut,
  hasDeviceWoken,
  isAccessTokenExpiringSoon,
  isAccessTokenValid,
  isCircuitOpen,
  onTokenRefreshed,
  readIdToken,
  readAccessToken,
  refreshAuthTokens,
  setLoggingOut,
  updateLastActivity,
  writeAuthTokens,
} from "@/lib/auth/client";
import { handleUnauthorizedClientState } from "@/lib/auth/client-session";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearAuth, setAuthLoading, setToken } from "@/lib/redux/slices/authSlice";

const REFRESH_BUFFER_SECONDS = 120;
const BASE_CHECK_INTERVAL_MS = 15000;
const WAKE_DETECTION_THRESHOLD_MS = 30000;

const isIdTokenUsable = (token: string | null, accessTokenSubject?: string): boolean => {
  if (!token) {
    return false;
  }

  const decoded = decodeIdToken(token);

  if (!decoded?.sub || !decoded.exp) {
    return false;
  }

  if (decoded.exp * 1000 <= Date.now()) {
    return false;
  }

  if (accessTokenSubject && decoded.sub !== accessTokenSubject) {
    return false;
  }

  return true;
};

const getAdaptiveInterval = (): number => {
  const failures = getConsecutiveFailures();
  if (failures > 0) {
    const baseInterval = Math.min(BASE_CHECK_INTERVAL_MS * 2 ** failures, 300000);
    const jitter = Math.random() * 0.5 * baseInterval;
    return baseInterval + jitter;
  }
  return BASE_CHECK_INTERVAL_MS;
};

export function useAuthBootstrap() {
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
    dispatch(setAuthLoading(true));

    try {
      const tokens = await refreshAuthTokens();

      if (!isMountedRef.current || getIsLoggingOut()) {
        return null;
      }

      return tokens?.accessToken ?? null;
    } finally {
      isRefreshingRef.current = false;
      dispatch(setAuthLoading(false));
    }
  }, [dispatch]);

  const checkAndRefreshToken = useCallback(async () => {
    if (getIsLoggingOut() || !isMountedRef.current) {
      return;
    }

    const deviceWoken = hasDeviceWoken(WAKE_DETECTION_THRESHOLD_MS);

    const token = readAccessToken();

    if (!token) {
      await performRefresh();
      return;
    }

    if (!isAccessTokenValid(token)) {
      clearAccessToken();
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

    const initAuth = () => {
      const token = readAccessToken();
      const idToken = readIdToken();

      if (token && isAccessTokenValid(token)) {
        const decoded = decodeAccessToken(token);
        const decodedIdToken = idToken ? decodeIdToken(idToken) : null;
        dispatch(setToken({ token, idToken, decoded: decoded ?? undefined, decodedIdToken }));

        const shouldRefreshForMissingIdToken = !isIdTokenUsable(idToken, decoded?.sub);
        const expiresIn = getAccessTokenExpiresIn(token);
        const shouldRefreshForTokenAge = expiresIn !== null && expiresIn <= REFRESH_BUFFER_SECONDS;

        if (shouldRefreshForMissingIdToken || shouldRefreshForTokenAge) {
          performRefresh().catch(() => undefined);
        }
      } else {
        if (token) {
          clearAccessToken();
        }
        dispatch(clearAuth());
        performRefresh().catch(() => undefined);
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
      writeAuthTokens({ accessToken: auth.token, idToken: auth.idToken });
    } else if (!auth.isAuthenticated) {
      clearAccessToken();
    }
  }, [auth.idToken, auth.token, auth.isAuthenticated, auth.hydrated]);

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
    const unsubscribe = onTokenRefreshed((tokens) => {
      if (!isMountedRef.current) {
        return;
      }

      if (tokens?.accessToken) {
        const decoded = decodeAccessToken(tokens.accessToken);
        const decodedIdToken = tokens.idToken ? decodeIdToken(tokens.idToken) : null;
        dispatch(
          setToken({
            token: tokens.accessToken,
            idToken: tokens.idToken,
            decoded: decoded ?? undefined,
            decodedIdToken,
          }),
        );
      } else if (auth.isAuthenticated || auth.token) {
        handleUnauthorizedClientState();
      } else {
        dispatch(clearAuth());
      }
    });

    return unsubscribe;
  }, [auth.isAuthenticated, auth.token, dispatch]);
}
