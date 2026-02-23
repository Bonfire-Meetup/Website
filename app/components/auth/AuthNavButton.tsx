"use client";

import { Suspense, useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { useAppSelector } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { LogInIcon, UserIcon } from "../shared/Icons";
import { IconButton } from "../ui/IconButton";
import { LoadingSpinner } from "../ui/LoadingSpinner";

function AuthNavButtonInner() {
  const auth = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isResolvingAuth = mounted && auth.loading && !auth.hydrated;
  const isAuthed = mounted && auth.isAuthenticated && auth.hydrated;
  const isSignInState = !isResolvingAuth && !isAuthed;
  const href = isAuthed ? PAGE_ROUTES.ME : PAGE_ROUTES.LOGIN;
  const ariaLabel = isResolvingAuth ? "Authenticating" : isAuthed ? "Account" : "Login";

  const buttonContent = (
    <IconButton
      ariaLabel={ariaLabel}
      size="md"
      shape="rounded"
      variant={isSignInState ? "plain" : "glass"}
      disabled={isResolvingAuth}
      className={
        isResolvingAuth
          ? "cursor-not-allowed opacity-75"
          : isAuthed
            ? "hover:scale-105 active:scale-95"
            : `${ENGAGEMENT_BRANDING.access.classes.signInNav} hover:scale-105 active:scale-95`
      }
    >
      {isResolvingAuth ? (
        <LoadingSpinner size="md" ariaLabel="Authenticating" />
      ) : isAuthed ? (
        <UserIcon className="h-5 w-5" />
      ) : (
        <LogInIcon className="h-5 w-5" />
      )}
    </IconButton>
  );

  if (isResolvingAuth) {
    return (
      <span aria-label={ariaLabel} aria-disabled="true">
        {buttonContent}
      </span>
    );
  }

  return (
    <Link href={href} prefetch={false} aria-label={ariaLabel} className="cursor-pointer">
      {buttonContent}
    </Link>
  );
}

export function AuthNavButton() {
  return (
    <Suspense fallback={null}>
      <AuthNavButtonInner />
    </Suspense>
  );
}
