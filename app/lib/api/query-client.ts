"use client";

import { QueryClient } from "@tanstack/react-query";

let sharedQueryClient: QueryClient | null = null;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 30000,
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 10000,
      },
    },
  });
}

export function setSharedQueryClient(queryClient: QueryClient) {
  sharedQueryClient = queryClient;
}

export function getSharedQueryClient() {
  return sharedQueryClient;
}
