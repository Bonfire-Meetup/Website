"use client";

import { useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import { useAppSelector } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { LogInIcon, UserIcon } from "../shared/icons";
import { IconButton } from "../ui/IconButton";

export function AuthNavButton() {
  const auth = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthed = mounted && auth.isAuthenticated && auth.hydrated;
  const href = isAuthed ? PAGE_ROUTES.ME : PAGE_ROUTES.LOGIN;

  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={isAuthed ? "Account" : "Login"}
      className="cursor-pointer"
    >
      <IconButton
        ariaLabel={isAuthed ? "Account" : "Login"}
        size="md"
        shape="rounded"
        variant="glass"
        className="hover:scale-105 active:scale-95"
      >
        {isAuthed ? <UserIcon className="h-5 w-5" /> : <LogInIcon className="h-5 w-5" />}
      </IconButton>
    </Link>
  );
}
