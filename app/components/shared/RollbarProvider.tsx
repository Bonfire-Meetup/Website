"use client";

import { Provider as RollbarProviderBase } from "@rollbar/react";

import { clientConfig } from "@/lib/rollbar/config";

export function RollbarProvider({ children }: { children: React.ReactNode }) {
  if (!clientConfig.accessToken) {
    return children;
  }
  return <RollbarProviderBase config={clientConfig}>{children}</RollbarProviderBase>;
}
