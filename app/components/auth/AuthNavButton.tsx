"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { Link } from "@/i18n/navigation";
import { revokeSession, setLoggingOut as setGlobalLoggingOut } from "@/lib/auth/client";
import { resetClientAuthState } from "@/lib/auth/client-session";
import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { USER_ROLES } from "@/lib/config/roles";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { hashToU64, makeAvatarSeedFromId } from "@/lib/utils/hash-rng";
import { compressUuid } from "@/lib/utils/uuid-compress";

import {
  BookmarkIcon,
  CameraIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  MailIcon,
  QrCodeIcon,
  UserIcon,
} from "../shared/Icons";
import { IconButton } from "../ui/IconButton";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { UserAvatar } from "../user/UserAvatar";

interface AuthNavButtonProps {
  className?: string;
  variant?: "glass" | "plain";
  size?: "sm" | "md" | "pill";
  shape?: "rounded" | "full";
  useSignInBranding?: boolean;
}

const MENU_SECTION_LABEL_CLASS =
  "flex items-center gap-2 px-2.25 pt-0.5 pb-0.75 text-[10px] font-medium text-neutral-400 dark:text-neutral-500";

function AuthNavButtonInner({
  className = "",
  variant,
  size = "md",
  shape = "rounded",
  useSignInBranding = true,
}: AuthNavButtonProps) {
  const tAccount = useTranslations("account");
  const t = useTranslations("header");
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isResolvingAuth = mounted && auth.loading && !auth.hydrated;
  const isAuthed = mounted && auth.isAuthenticated && auth.hydrated;
  const isSignInState = !isResolvingAuth && !isAuthed;
  const authRoles = auth.decodedToken?.rol ?? [];
  const isCrew = authRoles.includes(USER_ROLES.CREW);
  const isEditor = authRoles.includes(USER_ROLES.EDITOR);
  const href = isAuthed ? PAGE_ROUTES.ME : PAGE_ROUTES.LOGIN;
  const authUserId = auth.decodedToken?.sub ?? auth.decodedIdToken?.sub;
  const avatarSeed = authUserId ? makeAvatarSeedFromId(hashToU64(authUserId)) : null;
  const avatarName = auth.decodedIdToken?.name ?? auth.decodedIdToken?.email ?? null;
  let publicProfileHref: string | null = null;
  if (authUserId) {
    try {
      publicProfileHref = PAGE_ROUTES.USER(compressUuid(authUserId));
    } catch {
      publicProfileHref = null;
    }
  }
  let ariaLabel = t("login");
  if (isResolvingAuth) {
    ariaLabel = "Authenticating";
  } else if (isAuthed) {
    ariaLabel = t("profile");
  }

  let buttonStateClassName = `hover:scale-105 active:scale-95 ${className}`;
  if (isResolvingAuth) {
    buttonStateClassName = `cursor-not-allowed opacity-75 ${className}`;
  } else if (!isAuthed && useSignInBranding) {
    buttonStateClassName = `${ENGAGEMENT_BRANDING.access.classes.signInNav} ${buttonStateClassName}`;
  }

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isMenuOpen]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setIsMenuOpen(false);
    setGlobalLoggingOut(true);

    await revokeSession();
    resetClientAuthState({ dispatch, queryClient });
    setGlobalLoggingOut(false);

    router.replace(PAGE_ROUTES.HOME);
  };

  const menuItems = [
    {
      href: PAGE_ROUTES.ME,
      icon: HomeIcon,
      label: t("dashboard"),
    },
    ...(publicProfileHref
      ? [
          {
            href: publicProfileHref,
            icon: UserIcon,
            label: tAccount("viewProfile"),
          },
        ]
      : []),
    {
      href: PAGE_ROUTES.EVENT_CHECK_IN,
      icon: QrCodeIcon,
      label: t("checkIn"),
    },
    {
      href: PAGE_ROUTES.WATCH_LATER,
      icon: BookmarkIcon,
      label: t("watchLater"),
    },
  ] as const;

  const toolSections = [
    isCrew
      ? {
          title: t("crewTools"),
          items: [
            {
              href: PAGE_ROUTES.EVENT_READER,
              icon: CameraIcon,
              label: tAccount("reader"),
            },
          ],
        }
      : null,
    isEditor
      ? {
          title: t("editorTools"),
          items: [
            {
              href: PAGE_ROUTES.NEWSLETTER_EDITOR,
              icon: MailIcon,
              label: tAccount("newsletterEditor"),
            },
          ],
        }
      : null,
  ].filter(Boolean) as {
    title: string;
    items: {
      href: string;
      icon: typeof CameraIcon;
      label: string;
    }[];
  }[];

  const buttonContent = (
    <IconButton
      ariaLabel={ariaLabel}
      size={size}
      shape={shape}
      variant={variant ?? (isSignInState ? "plain" : "glass")}
      disabled={isResolvingAuth}
      onClick={isAuthed ? () => setIsMenuOpen((open) => !open) : undefined}
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

  if (isAuthed) {
    return (
      <div ref={menuRef} className="relative">
        <div
          aria-label={ariaLabel}
          aria-expanded={isMenuOpen}
          aria-haspopup="menu"
          className="contents"
        >
          {buttonContent}
        </div>
        {isMenuOpen ? (
          <div className="absolute top-[calc(100%+0.65rem)] right-[-0.1rem] z-50 w-[13.75rem]">
            <div className="overflow-hidden rounded-[18px] border border-white/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.86)_0%,rgba(255,255,255,0.74)_100%)] p-1.25 shadow-[0_26px_58px_-28px_rgba(15,23,42,0.22),0_10px_24px_-18px_rgba(15,23,42,0.14)] backdrop-blur-xl dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(20,20,24,0.86)_0%,rgba(14,14,18,0.76)_100%)] dark:shadow-[0_30px_60px_-30px_rgba(0,0,0,0.56),0_12px_26px_-20px_rgba(0,0,0,0.34)]">
              <div className={MENU_SECTION_LABEL_CLASS}>
                <span>{tAccount("title")}</span>
                <span className="h-px flex-1 bg-black/8 dark:bg-white/10" />
              </div>
              <div className="space-y-0.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={false}
                      className="flex items-center gap-2.5 rounded-[13px] px-2.25 py-1.75 text-[14px] font-medium text-neutral-800 transition-colors hover:bg-black/[0.025] dark:text-neutral-100 dark:hover:bg-white/[0.04]"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-400">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              {toolSections.length > 0 ? (
                <div className="mt-1.5 space-y-0.75">
                  {toolSections.map((section) => (
                    <div key={section.title} className="space-y-0.5">
                      <div className={MENU_SECTION_LABEL_CLASS}>
                        <span>{section.title}</span>
                        <span className="h-px flex-1 bg-black/8 dark:bg-white/10" />
                      </div>
                      {section.items.map((item) => {
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            prefetch={false}
                            className="flex items-center gap-2.5 rounded-[13px] px-2.25 py-1.75 text-[14px] font-medium text-neutral-800 transition-colors hover:bg-black/[0.025] dark:text-neutral-100 dark:hover:bg-white/[0.04]"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center text-neutral-500 dark:text-neutral-400">
                              <Icon className="h-4 w-4" />
                            </span>
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-1.5 space-y-0.5">
                <div className={MENU_SECTION_LABEL_CLASS}>
                  <span>{t("session")}</span>
                  <span className="h-px flex-1 bg-black/8 dark:bg-white/10" />
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex w-full items-center gap-2.5 rounded-[13px] px-2.25 py-1.75 text-left text-[14px] font-medium text-rose-700 transition-colors hover:bg-rose-50/65 hover:text-rose-800 disabled:opacity-60 dark:text-rose-300 dark:hover:bg-rose-500/8 dark:hover:text-rose-200"
                >
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center text-rose-600 dark:text-rose-300">
                    <LogOutIcon className="h-4 w-4" />
                  </span>
                  <span>{t("signOut")}</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
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
