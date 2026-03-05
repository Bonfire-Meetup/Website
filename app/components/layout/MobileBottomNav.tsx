"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { useAppSelector } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { useHaptics } from "@/lib/utils/haptics";

import { CalendarIcon, FilmIcon, HomeIcon, LogInIcon, UserIcon } from "../shared/Icons";
import { LoadingSpinner } from "../ui/LoadingSpinner";

import { MobileMoreMenu } from "./MobileMoreMenu";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  disabled?: boolean;
}

function SpinnerIcon({ className }: { className?: string }) {
  return <LoadingSpinner className={className} ariaLabel="Authenticating" />;
}

function MobileBottomNavInner() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const auth = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const haptics = useHaptics();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isResolvingAuth = mounted && auth.loading && !auth.hydrated;
  const isAuthed = mounted && auth.isAuthenticated && auth.hydrated;

  const navItems: NavItem[] = [
    { href: PAGE_ROUTES.HOME, label: t("home"), icon: HomeIcon, exact: true },
    { href: PAGE_ROUTES.EVENT_UPCOMING, label: t("upcoming"), icon: CalendarIcon },
    { href: PAGE_ROUTES.LIBRARY, label: t("library"), icon: FilmIcon },
    {
      href: isAuthed ? PAGE_ROUTES.ME : PAGE_ROUTES.LOGIN,
      label: isAuthed ? t("profile") : t("login"),
      icon: isResolvingAuth ? SpinnerIcon : isAuthed ? UserIcon : LogInIcon,
      disabled: isResolvingAuth,
    },
  ];

  const isActive = (item: NavItem) => {
    if (!mounted) {
      return false;
    }
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href.replace("#", "")) || pathname === item.href;
  };

  return (
    <nav
      className="fixed bottom-3 left-1/2 z-50 transition-[opacity,transform] duration-300 ease-out md:hidden"
      style={{
        transform: isMoreMenuOpen
          ? "translateX(-50%) translateY(10px) translateZ(0)"
          : "translateX(-50%) translateY(0) translateZ(0)",
        WebkitTransform: isMoreMenuOpen
          ? "translateX(-50%) translateY(10px) translateZ(0)"
          : "translateX(-50%) translateY(0) translateZ(0)",
        opacity: isMoreMenuOpen ? 0 : 1,
        pointerEvents: isMoreMenuOpen ? "none" : "auto",
      }}
    >
      <div className="nav-pill flex items-center gap-1 rounded-full bg-white/60 px-2 py-2 backdrop-blur-xl dark:bg-neutral-900/55">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const isSignInItem = !isAuthed && !isResolvingAuth && item.href === PAGE_ROUTES.LOGIN;
          const itemBody = (
            <span
              className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                active
                  ? "bg-gradient-to-br from-rose-600 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/40"
                  : item.disabled
                    ? "cursor-not-allowed text-neutral-400 opacity-70 dark:text-neutral-500"
                    : isSignInItem
                      ? ENGAGEMENT_BRANDING.access.classes.signInNav
                      : "text-neutral-500 hover:bg-neutral-100/50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200"
              }`}
              style={{
                transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <Icon className="h-5 w-5" />

              {active && (
                <span
                  className="absolute -inset-1 rounded-full opacity-60 blur-md"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(192, 38, 211, 0.4), rgba(249, 115, 22, 0.4), rgba(220, 38, 38, 0.4))",
                  }}
                />
              )}
            </span>
          );

          if (item.disabled) {
            return (
              <button
                key={item.href}
                type="button"
                disabled
                aria-label={item.label}
                className="group relative flex items-center justify-center"
              >
                {itemBody}
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (active) {
                  haptics.neutral();
                  return;
                }
                haptics.success();
              }}
              className="group relative flex items-center justify-center"
              aria-label={item.label}
            >
              {itemBody}
            </Link>
          );
        })}
        <MobileMoreMenu onOpenChange={setIsMoreMenuOpen} />
      </div>
    </nav>
  );
}

export function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner />
    </Suspense>
  );
}
