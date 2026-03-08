"use client";

import { useEffect, useState } from "react";

import { useAppSelector } from "@/lib/redux/hooks";
import { selectAuthRoles } from "@/lib/redux/selectors/authSelectors";

export function useIsRole(role: string): boolean {
  const hydrated = useAppSelector((state) => state.auth.hydrated);
  const roles = useAppSelector(selectAuthRoles);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && hydrated && roles.includes(role);
}
