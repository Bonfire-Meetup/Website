"use client";

import type { QueryClient } from "@tanstack/react-query";

import { getSharedQueryClient } from "@/lib/api/query-client";
import { clearAccessToken } from "@/lib/auth/client";
import { clearAuth } from "@/lib/redux/slices/authSlice";
import { clearProfile } from "@/lib/redux/slices/profileSlice";
import { store, type AppDispatch } from "@/lib/redux/store";

const AUTH_OWNED_QUERY_KEYS = [
  ["user-profile"],
  ["video-boosts"],
  ["watchlist"],
  ["video-watchlist"],
  ["event-rsvps"],
  ["event-questions"],
  ["passkeys"],
  ["check-in-token"],
] as const;

export function clearAuthOwnedQueries(queryClient: QueryClient) {
  AUTH_OWNED_QUERY_KEYS.forEach((queryKey) => {
    queryClient.removeQueries({ queryKey });
  });
}

export function resetClientAuthState({
  dispatch,
  queryClient,
}: {
  dispatch: AppDispatch;
  queryClient: QueryClient;
}) {
  dispatch(clearAuth());
  dispatch(clearProfile());
  clearAccessToken();
  clearAuthOwnedQueries(queryClient);
}

export function handleUnauthorizedClientState() {
  store.dispatch(clearAuth());
  store.dispatch(clearProfile());
  clearAccessToken();

  const queryClient = getSharedQueryClient();
  if (queryClient) {
    clearAuthOwnedQueries(queryClient);
  }
}
