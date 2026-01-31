"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { useAppSelector } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";

import { CalendarIcon, FilmIcon, LogInIcon, UserIcon } from "../shared/icons";

import { MobileMoreMenu } from "./MobileMoreMenu";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function MobileBottomNavInner() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const auth = useAppSelector((state) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAuthed = mounted && auth.isAuthenticated && auth.hydrated;

  const navItems: NavItem[] = [
    { href: PAGE_ROUTES.HOME, label: t("home"), icon: HomeIcon, exact: true },
    { href: PAGE_ROUTES.EVENT_UPCOMING, label: t("upcoming"), icon: CalendarIcon },
    { href: PAGE_ROUTES.LIBRARY, label: t("library"), icon: FilmIcon },
    {
      href: isAuthed ? PAGE_ROUTES.ME : PAGE_ROUTES.LOGIN,
      label: isAuthed ? t("profile") : t("login"),
      icon: isAuthed ? UserIcon : LogInIcon,
    },
  ];

  const isActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href.replace("#", "")) || pathname === item.href;
  };

  return (
    <nav
      className="fixed bottom-3 left-1/2 z-50 md:hidden"
      style={{
        transform: "translateX(-50%) translateZ(0)",
        WebkitTransform: "translateX(-50%) translateZ(0)",
      }}
    >
      <div className="nav-pill flex items-center gap-1 rounded-full bg-white/60 px-2 py-2 backdrop-blur-xl dark:bg-neutral-900/55">
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-center justify-center"
              aria-label={item.label}
            >
              <div
                className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 ease-out ${
                  active
                    ? "bg-gradient-to-br from-fuchsia-600 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/40"
                    : "text-neutral-500 hover:bg-neutral-100/50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200"
                }`}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <Icon className="h-5 w-5" />

                {active && (
                  <div
                    className="absolute -inset-1 rounded-full opacity-60 blur-md"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(192, 38, 211, 0.4), rgba(249, 115, 22, 0.4), rgba(220, 38, 38, 0.4))",
                    }}
                  />
                )}
              </div>
            </Link>
          );
        })}
        <MobileMoreMenu />
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
