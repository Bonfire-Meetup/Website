import { ApiError } from "@/lib/api/errors";
import {
  clearAccessToken,
  getValidAccessToken as getValidToken,
  isAccessTokenExpiringSoon,
  isAccessTokenValid,
  readAccessToken,
  refreshAccessToken,
} from "@/lib/auth/client";
import { createAuthHeaders } from "@/lib/utils/http";

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

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = readAccessToken();

  if (!token || isAccessTokenExpiringSoon(token)) {
    token = await refreshAccessToken();
  }

  if (!token) {
    throw new ApiError("Access token required", 401);
  }

  const response = await fetch(url, {
    ...options,
    headers: { ...createAuthHeaders(token), ...options.headers },
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return fetch(url, {
        ...options,
        headers: { ...createAuthHeaders(newToken), ...options.headers },
      });
    }
    clearAccessToken();
  }

  return response;
}

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError && error.status === 401) {
    return false;
  }
  return failureCount < 2;
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
