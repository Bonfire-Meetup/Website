"use client";

import Rollbar from "rollbar";

import { clientConfig } from "@/lib/rollbar/config";

let instance: Rollbar | null = null;

function getInstance(): Rollbar | null {
  if (typeof window === "undefined") {
    return null;
  }
  if (!clientConfig.accessToken) {
    return null;
  }
  if (!instance) {
    instance = new Rollbar(clientConfig);
  }
  return instance;
}

export function reportError(error: unknown, extra?: Record<string, unknown>): void {
  const rollbar = getInstance();
  if (!rollbar) {
    return;
  }
  const err = error instanceof Error ? error : new Error(String(error));
  rollbar.error(err, extra);
}
