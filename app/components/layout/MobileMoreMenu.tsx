"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { PAGE_ROUTES } from "@/lib/routes/pages";

import { CameraIcon, CloseIcon, ShieldIcon } from "../shared/icons";
import { LanguageToggle } from "../theme/LanguageToggle";
import { ThemeToggle } from "../theme/ThemeToggle";

function EnvelopeIcon({ className }: { className?: string }) {
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
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function NewspaperIcon({ className }: { className?: string }) {
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
        d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0018 18V9.75a2.25 2.25 0 00-2.25-2.25H16.5z"
      />
    </svg>
  );
}

function UserGroupIcon({ className }: { className?: string }) {
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
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function QuestionMarkCircleIcon({ className }: { className?: string }) {
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
        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
      />
    </svg>
  );
}

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

export function MobileMoreMenu() {
  const t = useTranslations("header");
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const animationMs = 300;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const menuItems: MenuItem[] = [
    { href: PAGE_ROUTES.PHOTOS, label: t("photos"), icon: CameraIcon },
    { href: PAGE_ROUTES.CREW, label: t("crew"), icon: UserGroupIcon },
    { href: PAGE_ROUTES.FAQ, label: t("faq"), icon: QuestionMarkCircleIcon },
    { href: PAGE_ROUTES.PRESS, label: t("press"), icon: NewspaperIcon },
    { href: PAGE_ROUTES.CONTACT_WITH_TYPE("general"), label: t("contact"), icon: EnvelopeIcon },
    { href: PAGE_ROUTES.LEGAL, label: t("codeOfConduct"), icon: ShieldIcon },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setIsRendered(true);
      document.body.style.overflow = "hidden";
    } else {
      if (isRendered) {
        closeTimer.current = setTimeout(() => {
          setIsRendered(false);
          closeTimer.current = null;
        }, animationMs);
      }
      document.body.style.overflow = "";
    }

    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
      document.body.style.overflow = "";
    };
  }, [isOpen, isRendered, animationMs]);

  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        onClick={() => {
          setIsRendered(true);
          requestAnimationFrame(() => setIsOpen(true));
        }}
        className="group relative flex h-12 w-12 items-center justify-center rounded-full text-neutral-500 transition-all duration-300 ease-out hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200"
        style={{
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        aria-label={t("more")}
      >
        <GridIcon className="h-5 w-5" />
      </button>
    );
  }

  const sheetContent =
    isRendered && mounted
      ? createPortal(
          <>
            {/* Backdrop */}
            <div
              className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out md:hidden ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
              onClick={closeMenu}
            />

            {/* Sheet */}
            <div
              className={`fixed right-0 bottom-0 left-0 z-50 md:hidden ${
                isOpen ? "translate-y-0" : "translate-y-full"
              }`}
              style={{
                transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
              }}
            >
              <div className="mx-4 mb-6 overflow-hidden rounded-3xl bg-white/95 shadow-2xl backdrop-blur-xl dark:bg-neutral-900/95">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2 dark:border-neutral-800">
                  <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                    {t("moreMenuTitle")}
                  </span>
                  <button
                    type="button"
                    onClick={closeMenu}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    aria-label={t("close")}
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>

                {/* Grid - 2 rows of 3 */}
                <div className="grid grid-cols-3 gap-0.5 p-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className="flex flex-col items-center justify-center gap-1 rounded-xl p-2 transition hover:bg-neutral-50 active:scale-95 dark:hover:bg-neutral-800"
                      >
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-600/20 via-orange-500/20 to-red-500/20 text-rose-600 dark:from-fuchsia-500/20 dark:via-orange-400/20 dark:to-red-400/20 dark:text-rose-400">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="line-clamp-2 text-center text-[10px] leading-tight font-medium text-neutral-700 dark:text-neutral-300">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Settings */}
                <div className="border-t border-neutral-100 px-2 py-2 dark:border-neutral-800">
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="flex items-center justify-center gap-1 rounded-xl py-2 transition hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                        {t("language")}
                      </span>
                      <LanguageToggle />
                    </div>
                    <div className="flex items-center justify-center gap-1 rounded-xl py-2 transition hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <span className="text-[10px] font-medium text-neutral-500 dark:text-neutral-400">
                        {t("theme")}
                      </span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsRendered(true);
          requestAnimationFrame(() => setIsOpen(true));
        }}
        className={`group relative flex flex-col items-center justify-center ${isOpen ? "text-rose-600 dark:text-rose-400" : ""}`}
        aria-label={t("more")}
      >
        <div
          className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ease-out ${
            isOpen
              ? "scale-110 bg-gradient-to-br from-fuchsia-600 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/40"
              : "text-neutral-500 hover:bg-neutral-100/50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <GridIcon className="h-5 w-5" />
        </div>
      </button>
      {sheetContent}
    </>
  );
}

function GridIcon({ className }: { className?: string }) {
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
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
      />
    </svg>
  );
}
