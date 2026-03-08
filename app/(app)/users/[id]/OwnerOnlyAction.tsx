"use client";

import { type ReactNode, useEffect, useState } from "react";

import { useAppSelector } from "@/lib/redux/hooks";
import { selectAuthUserId } from "@/lib/redux/selectors/authSelectors";

interface OwnerOnlyActionProps {
  profileUserId: string;
  children: ReactNode;
}

export function OwnerOnlyAction({ profileUserId, children }: OwnerOnlyActionProps) {
  const auth = useAppSelector((state) => state.auth);
  const authUserId = useAppSelector(selectAuthUserId);
  const [mounted, setMounted] = useState(false);
  const isOwner = authUserId === profileUserId;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !auth.hydrated || !isOwner) {
    return null;
  }

  return children;
}
