import { ApiError } from "@/lib/api/errors";
import {
  getValidAccessToken as getValidToken,
  isAccessTokenExpiringSoon,
  isAccessTokenValid,
  readAccessToken,
  refreshAccessToken,
} from "@/lib/auth/client";

/**
 * Get a valid access token for API requests.
 * Returns null if no token is available (not logged in).
 * Does NOT automatically refresh - use getValidAccessTokenAsync for that.
 */
export function getValidAccessToken(): string | null {
  const token = readAccessToken();
  if (!token) {
    return null;
  }
  return isAccessTokenValid(token) ? token : null;
}

/**
 * Get a valid access token, refreshing if necessary.
 * This is the preferred method for API requests.
 */
export function getValidAccessTokenAsync(): Promise<string | null> {
  return getValidToken();
}

export function ensureFreshToken(): Promise<string | null> {
  const token = readAccessToken();

  if (!token) {
    return refreshAccessToken();
  }

  if (!isAccessTokenValid(token) || isAccessTokenExpiringSoon(token)) {
    return refreshAccessToken();
  }

  return Promise.resolve(token);
}

export function shouldRetryMutation(failureCount: number, error: unknown): boolean {
  if (
    error instanceof ApiError &&
    typeof error.status === "number" &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return false;
  }
  return failureCount < 2;
}
