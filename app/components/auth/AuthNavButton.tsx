"use client";

import { useEffect, useState } from "react";
import { IconButton } from "../ui/IconButton";
import { LogInIcon, UserIcon } from "../shared/icons";
import { isAccessTokenValid, readAccessToken } from "@/app/lib/auth/client";

export function AuthNavButton() {
  const [href, setHref] = useState("/login");
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = readAccessToken();
    if (token && isAccessTokenValid(token)) {
      setHref("/me");
      setIsAuthed(true);
    } else {
      setHref("/login");
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
