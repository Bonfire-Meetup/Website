import { ApiError } from "@/lib/api/errors";
import {
  getValidAccessToken as getValidToken,
  isAccessTokenExpiringSoon,
  isAccessTokenValid,
  readAccessToken,
  refreshAccessToken,
} from "@/lib/auth/client";

export function getValidAccessToken(): string | null {
  const token = readAccessToken();
  if (!token) {
    return null;
  }
  return isAccessTokenValid(token) ? token : null;
}

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
