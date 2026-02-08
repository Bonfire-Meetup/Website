"use client";

import { type ReactNode, useEffect, useState } from "react";

import { useAppSelector } from "@/lib/redux/hooks";

interface OwnerOnlyActionProps {
  profileUserId: string;
  children: ReactNode;
}

export function OwnerOnlyAction({ profileUserId, children }: OwnerOnlyActionProps) {
  const auth = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const isOwner = auth.user?.id === profileUserId;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !auth.hydrated || !isOwner) {
    return null;
  }

  return children;
}
