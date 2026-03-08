"use client";

import { useAuthBootstrap } from "@/lib/redux/hooks";

export function AuthInitializer() {
  useAuthBootstrap();

  return null;
}
