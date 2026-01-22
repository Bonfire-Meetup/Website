"use client";

import { useEffect, useState } from "react";
import { IconButton } from "../ui/IconButton";
import { LogInIcon, UserIcon } from "../shared/icons";
import { isAccessTokenValid, readAccessToken } from "@/lib/auth/client";
import { PAGE_ROUTES } from "@/lib/routes/pages";

export function AuthNavButton() {
  const [href, setHref] = useState<string>(PAGE_ROUTES.LOGIN);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = readAccessToken();
    if (token && isAccessTokenValid(token)) {
      setHref(PAGE_ROUTES.ME);
      setIsAuthed(true);
    } else {
      setHref(PAGE_ROUTES.LOGIN);
      setIsAuthed(false);
    }
  }, []);

  return (
    <a href={href} aria-label={isAuthed ? "Account" : "Login"} className="cursor-pointer">
      <IconButton
        ariaLabel={isAuthed ? "Account" : "Login"}
        size="md"
        shape="rounded"
        variant="glass"
        className="hover:scale-105 active:scale-95"
      >
        {isAuthed ? <UserIcon className="h-5 w-5" /> : <LogInIcon className="h-5 w-5" />}
      </IconButton>
    </a>
  );
}
