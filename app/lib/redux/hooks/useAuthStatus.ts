"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/lib/redux/store";

export type AuthQueryScope = "pending" | "auth" | "anon";

export function useAuthStatus() {
  const auth = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  let queryScope: AuthQueryScope = "anon";
  if (!mounted || !auth.hydrated) {
    queryScope = "pending";
  } else if (auth.isAuthenticated) {
    queryScope = "auth";
  }

  return {
    ...auth,
    isAnonymous: queryScope === "anon",
    isMounted: mounted,
    isPending: queryScope === "pending",
    queryScope,
  };
}
