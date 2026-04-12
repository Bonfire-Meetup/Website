"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";

import { createAppQueryClient, setSharedQueryClient } from "@/lib/api/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useMemo(() => {
    const client = createAppQueryClient();
    setSharedQueryClient(client);
    return client;
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
