"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

import { createAppQueryClient, setSharedQueryClient } from "@/lib/api/query-client";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const client = createAppQueryClient();
    setSharedQueryClient(client);
    return client;
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
