"use client";

import { useEffect, useState } from "react";

import { useAppSelector } from "@/lib/redux/hooks";
import type { RootState } from "@/lib/redux/store";

export function useIsRole(role: string): boolean {
  const auth = useAppSelector((state) => state.auth) as RootState["auth"];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && auth.hydrated && (auth.user?.decodedToken?.rol ?? []).includes(role);
}
