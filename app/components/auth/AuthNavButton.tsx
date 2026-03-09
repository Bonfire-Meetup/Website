"use client";

import { Suspense, useEffect, useState } from "react";

import { Link } from "@/i18n/navigation";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { useAppSelector } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { hashToU64, makeAvatarSeedFromId } from "@/lib/utils/hash-rng";

import { LogInIcon, UserIcon } from "../shared/Icons";
import { UserAvatar } from "../user/UserAvatar";
import { IconButton } from "../ui/IconButton";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface AuthNavButtonProps {
  className?: string;
  variant?: "glass" | "plain";
  size?: "sm" | "md" | "pill";
  shape?: "rounded" | "full";
  useSignInBranding?: boolean;
}

function AuthNavButtonInner({
  className = "",
  variant,
  size = "md",
  shape = "rounded",
  useSignInBranding = true,
}: AuthNavButtonProps) {
  const auth = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isResolvingAuth = mounted && auth.loading && !auth.hydrated;
  const isAuthed = mounted && auth.isAuthenticated && auth.hydrated;
  const isSignInState = !isResolvingAuth && !isAuthed;
  const href = isAuthed ? PAGE_ROUTES.ME : PAGE_ROUTES.LOGIN;
  const authUserId = auth.decodedToken?.sub ?? auth.decodedIdToken?.sub;
  const avatarSeed = authUserId ? makeAvatarSeedFromId(hashToU64(authUserId)) : null;
  const avatarName = auth.decodedIdToken?.name ?? auth.decodedIdToken?.email ?? null;
  let ariaLabel = "Login";
  if (isResolvingAuth) {
    ariaLabel = "Authenticating";
  } else if (isAuthed) {
    ariaLabel = "Account";
  }

  let buttonStateClassName = `hover:scale-105 active:scale-95 ${className}`;
  if (isResolvingAuth) {
    buttonStateClassName = `cursor-not-allowed opacity-75 ${className}`;
  } else if (!isAuthed && useSignInBranding) {
    buttonStateClassName = `${ENGAGEMENT_BRANDING.access.classes.signInNav} ${buttonStateClassName}`;
  }

  const buttonContent = (
    <IconButton
      ariaLabel={ariaLabel}
      size={size}
      shape={shape}
      variant={variant ?? (isSignInState ? "plain" : "glass")}
      disabled={isResolvingAuth}
      className={buttonStateClassName}
    >
      {isResolvingAuth ? (
        <LoadingSpinner size="md" ariaLabel="Authenticating" />
      ) : isAuthed ? (
        avatarSeed ? (
          <UserAvatar
            avatarSeed={avatarSeed}
            className="ring-1 ring-black/6 dark:ring-white/10"
            isTiny
            name={avatarName}
            size={24}
          />
        ) : (
          <UserIcon className="h-5 w-5" />
        )
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

export function AuthNavButton(props: AuthNavButtonProps) {
  return (
    <Suspense fallback={null}>
      <AuthNavButtonInner {...props} />
    </Suspense>
  );
}
