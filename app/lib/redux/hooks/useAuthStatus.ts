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

  const queryScope: AuthQueryScope =
    !mounted || !auth.hydrated ? "pending" : auth.isAuthenticated ? "auth" : "anon";

  return {
    ...auth,
    isAnonymous: queryScope === "anon",
    isMounted: mounted,
    isPending: queryScope === "pending",
    queryScope,
  };
}
