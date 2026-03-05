"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useBodyScrollLock } from "@/components/shared/useBodyScrollLock";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { COOKIE_KEYS, getCookie, setCookie } from "@/lib/storage/keys";
import { useHaptics } from "@/lib/utils/haptics";

import { useI18n } from "../providers/I18nClientSync";
import {
  AnimatedMenuIcon,
  CameraIcon,
  ClockIcon,
  CloseIcon,
  CookieIcon,
  DocumentTextIcon,
  GlobeIcon,
  MailIcon,
  MoonIcon,
  MoreHorizontalIcon,
  NewspaperIcon,
  QuestionMarkCircleIcon,
  ShieldIcon,
  SunIcon,
  SystemIcon,
  UsersIcon,
} from "../shared/Icons";
import { useTheme } from "../theme/useTheme";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface MobileMoreMenuProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export function MobileMoreMenu({ onOpenChange }: MobileMoreMenuProps) {
  const t = useTranslations("header");
  const tFooter = useTranslations("footer");
  const tCookie = useTranslations("cookieConsent");
  const pathname = usePathname();
  const { locale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const haptics = useHaptics();
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasConsent, setHasConsent] = useState(true);
  const animationMs = 320;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const focusRestoreRef = useRef<HTMLElement | null>(null);
  const openedWithPointerRef = useRef(false);

  const menuItems: MenuItem[] = [
    { href: PAGE_ROUTES.PHOTOS, label: t("photos"), icon: CameraIcon },
    { href: PAGE_ROUTES.CREW, label: t("crew"), icon: UsersIcon },
    { href: PAGE_ROUTES.TIMELINE, label: tFooter("timelineLabel"), icon: ClockIcon },
    {
      href: PAGE_ROUTES.NEWSLETTER_ARCHIVE,
      label: tFooter("newsletterArchiveLabel"),
      icon: MailIcon,
    },
    { href: PAGE_ROUTES.FAQ, label: t("faq"), icon: QuestionMarkCircleIcon },
    { href: PAGE_ROUTES.CONTACT_WITH_TYPE("general"), label: t("contact"), icon: MailIcon },
    { href: PAGE_ROUTES.PRESS, label: t("press"), icon: NewspaperIcon },
    { href: PAGE_ROUTES.LEGAL, label: "CoC", icon: ShieldIcon },
    { href: PAGE_ROUTES.THIRD_PARTY, label: tFooter("attributionsLabel"), icon: DocumentTextIcon },
  ];

  useEffect(() => {
    setMounted(true);
    const consent = getCookie(COOKIE_KEYS.CONSENT);
    setHasConsent(Boolean(consent));
  }, []);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (isOpen) {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
      setIsRendered(true);

      focusRestoreRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else if (isRendered) {
      if (
        !openedWithPointerRef.current &&
        focusRestoreRef.current &&
        focusRestoreRef.current !== document.body &&
        focusRestoreRef.current !== triggerButtonRef.current
      ) {
        focusRestoreRef.current.focus();
      }
      triggerButtonRef.current?.blur();
      closeTimer.current = setTimeout(() => {
        setIsRendered(false);
        closeTimer.current = null;
      }, animationMs);
      openedWithPointerRef.current = false;
    }

    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
      }
    };
  }, [isOpen, isRendered, animationMs]);

  useBodyScrollLock(isRendered);

  const openMenu = () => {
    if (isOpen) {
      return;
    }
    haptics.neutral();
    setIsRendered(true);
    requestAnimationFrame(() => setIsOpen(true));
  };

  const closeMenu = () => {
    if (!isOpen) {
      return;
    }
    haptics.neutral();
    setIsOpen(false);
  };

  const handleAcceptCookies = () => {
    haptics.success();
    setCookie(COOKIE_KEYS.CONSENT, "essential", 365);
    setHasConsent(true);
  };

  const handleDismissCookies = () => {
    haptics.neutral();
    setCookie(COOKIE_KEYS.CONSENT, "dismissed", 365);
    setHasConsent(true);
  };

  const toggleLocale = () => {
    haptics.neutral();
    setLocale(locale === "en" ? "cs" : "en");
  };

  const cycleTheme = () => {
    const themes: ("light" | "dark" | "system")[] = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    haptics.neutral();
    setTheme(themes[nextIndex]);
  };

  const isMenuItemActive = (href: string) => {
    if (!mounted) {
      return false;
    }
    const itemPath = href.split(/[?#]/, 1)[0];
    return pathname === itemPath || pathname.startsWith(itemPath);
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    setIsOpen((previous) => (previous ? false : previous));
  }, [pathname]);

  if (!mounted) {
    return (
      <button
        type="button"
        onPointerDown={() => {
          openedWithPointerRef.current = true;
        }}
        onClick={openMenu}
        className="group relative flex h-12 w-12 appearance-none items-center justify-center rounded-full border-0 text-neutral-500 transition-all duration-300 ease-out outline-none [-webkit-tap-highlight-color:transparent] hover:bg-neutral-100 hover:text-neutral-700 focus:outline-none focus-visible:outline-none dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200"
        style={{
          transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          WebkitTapHighlightColor: "transparent",
          WebkitAppearance: "none",
        }}
        aria-label={t("more")}
      >
        <MoreHorizontalIcon className="h-5 w-5" />
      </button>
    );
  }

  const sheetContent =
    isRendered && mounted
      ? createPortal(
          <>
            <div
              className={`fixed inset-0 z-[70] md:hidden ${isOpen ? "opacity-100" : "opacity-0"}`}
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.25)",
                backdropFilter: isOpen ? "blur(12px)" : "blur(0px)",
                WebkitBackdropFilter: isOpen ? "blur(12px)" : "blur(0px)",
                transition:
                  "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1), backdrop-filter 400ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onClick={closeMenu}
            />

            <div
              className="fixed right-0 bottom-0 left-0 z-[71] md:hidden"
              style={{
                transform: isOpen ? "translateY(0)" : "translateY(120%)",
                transition: "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <div
                className="mx-4 mb-6 overflow-hidden rounded-3xl border border-white/30 bg-white/60 shadow-lg backdrop-blur-xl dark:border-white/10 dark:bg-neutral-900/55"
                style={{
                  transform: isOpen ? "scale(1)" : "scale(0.92)",
                  opacity: isOpen ? 1 : 0,
                  transition:
                    "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <div className="flex items-center justify-end px-3 pb-2">
                  <button
                    ref={closeButtonRef}
                    type="button"
                    onClick={closeMenu}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                    aria-label={t("close")}
                  >
                    <CloseIcon className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                  {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const delay = isOpen ? index * 50 : 0;
                    const active = isMenuItemActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          haptics.success();
                          closeMenu();
                        }}
                        className="group flex flex-col items-center justify-center gap-2 rounded-2xl p-3 transition active:scale-95"
                        style={{
                          transform: isOpen
                            ? "translateY(0) scale(1)"
                            : "translateY(16px) scale(0.85)",
                          opacity: isOpen ? 1 : 0,
                          transition: `transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}ms, opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) ${delay}ms`,
                        }}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                            active
                              ? "bg-gradient-to-br from-rose-600 via-orange-500 to-red-500 text-white shadow-md shadow-orange-500/35"
                              : "bg-gradient-to-br from-rose-600/15 via-orange-500/15 to-red-500/15 text-rose-600 group-hover:from-rose-600/25 group-hover:via-orange-500/25 group-hover:to-red-500/25 dark:from-rose-500/15 dark:via-orange-400/15 dark:to-red-400/15 dark:text-rose-400 dark:group-hover:from-rose-500/25 dark:group-hover:via-orange-400/25 dark:group-hover:to-red-400/25"
                          }`}
                          style={{
                            transform: isOpen
                              ? "scale(1) rotate(0deg)"
                              : "scale(0.7) rotate(-15deg)",
                            transition: `transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + 60}ms, background-color 200ms ease`,
                          }}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        <span
                          className={`text-center text-[11px] leading-tight font-medium ${
                            active
                              ? "text-rose-700 dark:text-rose-300"
                              : "text-neutral-700 dark:text-neutral-300"
                          }`}
                          style={{
                            transform: isOpen ? "translateY(0)" : "translateY(6px)",
                            opacity: isOpen ? 1 : 0,
                            transition: `transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1) ${delay + 100}ms, opacity 300ms ease-out ${delay + 100}ms`,
                          }}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                <div
                  className="border-t border-neutral-200/70 dark:border-neutral-700/50"
                  style={{
                    transform: isOpen ? "translateY(0)" : "translateY(20px)",
                    opacity: isOpen ? 1 : 0,
                    transition:
                      "transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1) 250ms, opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 250ms",
                  }}
                >
                  {!hasConsent ? (
                    <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-rose-50/50 via-orange-50/50 to-red-50/50 px-4 py-3 dark:from-rose-950/30 dark:via-orange-950/30 dark:to-red-950/30">
                      <div className="flex items-center gap-2">
                        <CookieIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          {tCookie("message")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleAcceptCookies}
                          className="rounded-md bg-gradient-to-r from-rose-600 to-orange-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:opacity-90 active:scale-95"
                        >
                          {tCookie("accept")}
                        </button>
                        <button
                          onClick={handleDismissCookies}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200/50 hover:text-neutral-600 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-400"
                          aria-label={tCookie("closeAria")}
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid grid-cols-3 gap-px bg-neutral-200/40 dark:bg-neutral-700/40">
                    <button
                      onClick={toggleLocale}
                      className="flex items-center justify-center gap-2 bg-white/70 px-4 py-3 transition hover:bg-white/80 active:scale-95 dark:bg-neutral-900/60 dark:hover:bg-neutral-800/70"
                    >
                      <GlobeIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      <span className="text-xs font-medium text-neutral-500 uppercase dark:text-neutral-400">
                        {locale}
                      </span>
                    </button>

                    <button
                      onClick={cycleTheme}
                      className="flex items-center justify-center gap-2 bg-white/70 px-4 py-3 transition hover:bg-white/80 active:scale-95 dark:bg-neutral-900/60 dark:hover:bg-neutral-800/70"
                    >
                      {theme === "light" && <SunIcon className="h-4 w-4 text-amber-500" />}
                      {theme === "dark" && <MoonIcon className="h-4 w-4 text-blue-400" />}
                      {theme === "system" && (
                        <SystemIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      )}
                      <span className="text-xs font-medium text-neutral-500 capitalize dark:text-neutral-400">
                        {theme}
                      </span>
                    </button>

                    <Link
                      href="/legal#cookies"
                      className="flex items-center justify-center gap-2 bg-white/70 px-4 py-3 transition hover:bg-white/80 active:scale-95 dark:bg-neutral-900/60 dark:hover:bg-neutral-800/70"
                      onClick={() => {
                        haptics.success();
                        closeMenu();
                      }}
                    >
                      <CookieIcon className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
                      <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        Cookies
                      </span>
                    </Link>
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
        ref={triggerButtonRef}
        type="button"
        onPointerDown={() => {
          openedWithPointerRef.current = true;
        }}
        onClick={openMenu}
        className="group relative flex appearance-none flex-col items-center justify-center rounded-full border-0 outline-none [-webkit-tap-highlight-color:transparent] focus:outline-none focus-visible:outline-none"
        aria-label={t("more")}
        style={{ WebkitAppearance: "none", WebkitTapHighlightColor: "transparent" }}
      >
        <span
          className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ease-out ${
            isOpen
              ? "scale-110 bg-gradient-to-br from-rose-600 via-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/40"
              : "text-neutral-500 hover:bg-neutral-100/50 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/5 dark:hover:text-neutral-200"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <AnimatedMenuIcon className="h-5 w-5" isOpen={isOpen} />
        </span>
      </button>
      {sheetContent}
    </>
  );
}
