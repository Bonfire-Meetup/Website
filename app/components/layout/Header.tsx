"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import { PAGE_ROUTES } from "@/lib/routes/pages";
import { useHaptics } from "@/lib/utils/haptics";
import { prefersReducedMotion } from "@/lib/utils/prefers-reduced-motion";

import { AuthNavButton } from "../auth/AuthNavButton";
import { FilmIcon } from "../shared/Icons";
import { LanguageToggle } from "../theme/LanguageToggle";
import { ThemeToggle } from "../theme/ThemeToggle";
import { Button } from "../ui/Button";

interface MobileSectionMarker {
  dotClassName: string;
  label: string;
}

interface DesktopNavItem {
  href: string;
  label: string;
  prefetch?: boolean;
  matches: (pathname: string) => boolean;
}

const DESKTOP_NAV_WRAPPER_CLASS =
  "glass relative flex items-center gap-0.5 rounded-full border border-white/55 px-1.5 py-1 shadow-raised fold:gap-1 fold:px-2 xl:gap-1.5 xl:px-2.5 dark:border-white/10 dark:shadow-raised";

const DESKTOP_NAV_ITEM_BASE_CLASS =
  "relative z-10 rounded-full py-1.5 text-sm font-medium whitespace-nowrap transition-[background-color,color,box-shadow] duration-200 md:px-2 fold:px-3 xl:min-w-[5rem] xl:px-4";

const DESKTOP_NAV_ACTIVE_TEXT_CLASS = "text-neutral-950 dark:text-white";

const DESKTOP_NAV_ACTIVE_GLASS_CLASS =
  "bg-gradient-to-b from-orange-950/[0.035] to-orange-950/[0.085] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_0_0_1px_rgba(124,45,18,0.1),0_5px_12px_-7px_rgba(124,45,18,0.35)] dark:from-white/14 dark:to-white/6 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(251,146,60,0.18),0_10px_22px_-18px_rgba(244,63,94,0.34)]";

const DESKTOP_NAV_ITEM_INACTIVE_CLASS =
  "text-neutral-600 hover:bg-white/70 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/7 dark:hover:text-white";

const DESKTOP_UTILS_WRAPPER_CLASS =
  "glass hidden md:flex md:items-center md:gap-0.5 md:rounded-full md:border md:border-white/55 md:px-1.5 md:py-1 md:shadow-raised dark:border-white/10 dark:shadow-raised";

const DESKTOP_UTIL_BUTTON_CLASS =
  "h-8 w-8 rounded-full text-neutral-500 transition-[background-color,color] duration-200 hover:bg-white/70 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/8 dark:hover:text-white";

const DESKTOP_NAV_ITEMS: DesktopNavItem[] = [
  {
    href: PAGE_ROUTES.ANCHOR.TOP,
    label: "home",
    matches: (pathname) => pathname === PAGE_ROUTES.HOME,
  },
  {
    href: PAGE_ROUTES.EVENT_UPCOMING,
    label: "upcoming",
    matches: (pathname) => pathname.startsWith("/events"),
  },
  {
    href: PAGE_ROUTES.PHOTOS,
    label: "photos",
    matches: (pathname) => pathname.startsWith("/photos"),
  },
  {
    href: PAGE_ROUTES.CREW,
    label: "crew",
    matches: (pathname) => pathname.startsWith("/crew"),
  },
  {
    href: PAGE_ROUTES.SPEAK,
    label: "speak",
    prefetch: false,
    matches: (pathname) =>
      pathname === PAGE_ROUTES.SPEAK || pathname.startsWith(`${PAGE_ROUTES.SPEAK}/`),
  },
  {
    href: PAGE_ROUTES.SUPPORT,
    label: "support",
    prefetch: false,
    matches: (pathname) =>
      pathname.startsWith(PAGE_ROUTES.SUPPORT) ||
      pathname.startsWith(PAGE_ROUTES.FAQ) ||
      pathname.startsWith(PAGE_ROUTES.GUIDES) ||
      pathname.startsWith(PAGE_ROUTES.LEGAL) ||
      pathname.startsWith(PAGE_ROUTES.CONTACT),
  },
];

function getMobileSectionMarker(
  pathname: string,
  t: ReturnType<typeof useTranslations<"header">>,
): MobileSectionMarker {
  if (pathname === PAGE_ROUTES.HOME) {
    return {
      dotClassName: "bg-rose-500/80 dark:bg-rose-400/85",
      label: t("home"),
    };
  }

  if (pathname.startsWith("/watch") || pathname.startsWith(PAGE_ROUTES.LIBRARY)) {
    return {
      dotClassName: "bg-orange-500/80 dark:bg-orange-400/85",
      label: t("library"),
    };
  }

  if (pathname.startsWith("/me/watch-later")) {
    return {
      dotClassName: "bg-pink-500/80 dark:bg-pink-400/85",
      label: t("watchLater"),
    };
  }

  if (pathname.startsWith("/me") || pathname.startsWith("/users")) {
    return {
      dotClassName: "bg-slate-500/80 dark:bg-slate-400/85",
      label: t("profile"),
    };
  }

  if (pathname.startsWith("/events")) {
    return {
      dotClassName: "bg-amber-500/80 dark:bg-amber-400/85",
      label: t("events"),
    };
  }

  if (pathname.startsWith("/photos")) {
    return {
      dotClassName: "bg-sky-500/80 dark:bg-sky-400/85",
      label: t("photos"),
    };
  }

  if (pathname.startsWith("/crew")) {
    return {
      dotClassName: "bg-blue-500/80 dark:bg-blue-400/85",
      label: t("crew"),
    };
  }

  if (pathname.startsWith("/guides")) {
    return {
      dotClassName: "bg-violet-500/80 dark:bg-violet-400/85",
      label: t("support"),
    };
  }

  if (pathname.startsWith(PAGE_ROUTES.SUPPORT)) {
    return {
      dotClassName: "bg-violet-500/80 dark:bg-violet-400/85",
      label: t("support"),
    };
  }

  if (pathname.startsWith("/newsletters")) {
    return {
      dotClassName: "bg-pink-500/80 dark:bg-pink-400/85",
      label: t("newsletters"),
    };
  }

  if (pathname.startsWith("/legal")) {
    return {
      dotClassName: "bg-violet-500/80 dark:bg-violet-400/85",
      label: t("support"),
    };
  }

  if (pathname.startsWith("/timeline")) {
    return {
      dotClassName: "bg-fuchsia-500/80 dark:bg-fuchsia-400/85",
      label: t("timeline"),
    };
  }

  if (pathname === PAGE_ROUTES.SPEAK || pathname.startsWith(`${PAGE_ROUTES.SPEAK}/`)) {
    return {
      dotClassName: "bg-orange-500/80 dark:bg-orange-400/85",
      label: t("speak"),
    };
  }

  if (pathname.startsWith("/guild")) {
    return {
      dotClassName: "bg-emerald-500/80 dark:bg-emerald-400/85",
      label: t("guild"),
    };
  }

  if (pathname.startsWith("/press")) {
    return {
      dotClassName: "bg-blue-500/80 dark:bg-blue-400/85",
      label: t("press"),
    };
  }

  if (pathname.startsWith("/faq")) {
    return {
      dotClassName: "bg-violet-500/80 dark:bg-violet-400/85",
      label: t("support"),
    };
  }

  if (pathname.startsWith("/contact")) {
    return {
      dotClassName: "bg-violet-500/80 dark:bg-violet-400/85",
      label: t("support"),
    };
  }

  return {
    dotClassName: "bg-rose-500/80 dark:bg-rose-400/85",
    label: t("home"),
  };
}

function HeaderInner() {
  const t = useTranslations("header");
  const pathname = usePathname();
  const haptics = useHaptics();
  const mobileSectionMarker = getMobileSectionMarker(pathname, t);
  const isLibraryContext =
    pathname.startsWith("/watch") || pathname.startsWith(PAGE_ROUTES.LIBRARY);
  const activeNavIndex = DESKTOP_NAV_ITEMS.findIndex((item) => item.matches(pathname));

  const navRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const previousIndicatorLeftRef = useRef<number | null>(null);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const nav = navRef.current;

    if (!nav) {
      return;
    }

    const measure = () => {
      const item =
        activeNavIndex >= 0
          ? nav.querySelectorAll<HTMLElement>(":scope > a")[activeNavIndex]
          : undefined;

      setIndicator(
        item && item.offsetWidth > 0 ? { left: item.offsetLeft, width: item.offsetWidth } : null,
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(nav);

    return () => observer.disconnect();
  }, [activeNavIndex]);

  const indicatorLeft = indicator?.left ?? null;

  useEffect(() => {
    const previousLeft = previousIndicatorLeftRef.current;
    previousIndicatorLeftRef.current = indicatorLeft;

    if (
      indicatorLeft === null ||
      previousLeft === null ||
      previousLeft === indicatorLeft ||
      prefersReducedMotion()
    ) {
      return;
    }

    indicatorRef.current?.animate(
      [
        { scale: "1 1" },
        { offset: 0.35, scale: "1.16 0.84" },
        { offset: 0.75, scale: "0.97 1.04" },
        { scale: "1 1" },
      ],
      { duration: 560, easing: "ease-out" },
    );
  }, [indicatorLeft]);

  return (
    <header
      className="glass mobile-nav-glass fixed top-0 right-0 left-0 z-50 border-b border-black/3 shadow-[0_1px_3px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06)] transition-[box-shadow] duration-300 dark:border-white/4 dark:shadow-[0_1px_3px_rgba(0,0,0,0.25),0_1px_2px_rgba(0,0,0,0.2)]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="relative mx-auto flex h-12 max-w-7xl items-center justify-between px-2.5 sm:px-6 md:grid md:h-16 md:grid-cols-[1fr_auto_1fr] md:gap-2 lg:px-8">
        <div className="relative z-10 flex items-center gap-3 md:justify-self-start">
          <Link
            href={PAGE_ROUTES.HOME}
            className="flex items-center gap-3 transition-opacity hover:opacity-80 md:rounded-2xl md:px-2 md:py-1.5"
            aria-label={t("home")}
          >
            <Image
              src="/assets/brand/RGB_PNG_01_bonfire_black_gradient.png"
              alt={t("logoAlt")}
              width={140}
              height={40}
              className="h-7 w-auto md:h-9 dark:hidden"
              priority
            />
            <Image
              src="/assets/brand/RGB_PNG_03_bonfire_white_gradient.png"
              alt={t("logoAlt")}
              width={140}
              height={40}
              className="hidden h-7 w-auto md:h-9 dark:block"
              priority
            />
          </Link>
        </div>

        <div className="pointer-events-none absolute top-1/2 left-1/2 z-0 w-[calc(100%-9.75rem)] max-w-[11rem] min-w-0 -translate-x-1/2 -translate-y-1/2 md:hidden">
          <div className="flex h-8 w-full items-center justify-center gap-1.5 px-1.5">
            <span className="min-w-0 truncate text-xs font-medium tracking-wider text-neutral-600 dark:text-neutral-300">
              {mobileSectionMarker.label}
            </span>
            <span className={`h-1.5 w-1.5 rounded-full ${mobileSectionMarker.dotClassName}`} />
          </div>
        </div>

        <nav className="hidden md:block">
          <div ref={navRef} className={DESKTOP_NAV_WRAPPER_CLASS}>
            {indicator && (
              <span
                ref={indicatorRef}
                aria-hidden="true"
                className={`pointer-events-none absolute top-1 bottom-1 left-0 rounded-full transition-[translate,width] duration-500 ease-[cubic-bezier(0.3,1.3,0.5,1)] will-change-transform motion-reduce:transition-none ${DESKTOP_NAV_ACTIVE_GLASS_CLASS}`}
                style={{ translate: `${indicator.left}px 0`, width: indicator.width }}
              />
            )}
            {DESKTOP_NAV_ITEMS.map((item, index) => {
              const isActive = index === activeNavIndex;
              const activeClass = indicator
                ? DESKTOP_NAV_ACTIVE_TEXT_CLASS
                : `${DESKTOP_NAV_ACTIVE_TEXT_CLASS} ${DESKTOP_NAV_ACTIVE_GLASS_CLASS}`;

              return (
                <Button
                  key={item.href}
                  href={item.href}
                  variant="plain"
                  size="sm"
                  prefetch={item.prefetch}
                  className={`${DESKTOP_NAV_ITEM_BASE_CLASS} ${
                    isActive ? activeClass : DESKTOP_NAV_ITEM_INACTIVE_CLASS
                  }`}
                  ariaLabel={t(item.label)}
                >
                  <span>{t(item.label)}</span>
                </Button>
              );
            })}
          </div>
        </nav>

        <div className="relative z-10 flex items-center gap-2 md:justify-self-end">
          <div className={DESKTOP_UTILS_WRAPPER_CLASS}>
            <LanguageToggle
              variant="plain"
              size="sm"
              className={`${DESKTOP_UTIL_BUTTON_CLASS} px-0`}
            />
            <ThemeToggle variant="plain" size="sm" className={DESKTOP_UTIL_BUTTON_CLASS} />
            <AuthNavButton
              variant="plain"
              size="sm"
              useSignInBranding={false}
              className={DESKTOP_UTIL_BUTTON_CLASS}
            />
          </div>
          <Button
            href={PAGE_ROUTES.LIBRARY}
            onClick={() => {
              if (isLibraryContext) {
                haptics.neutral();
                return;
              }
              haptics.success();
            }}
            variant="primary"
            size="sm"
            className={`text-2xs rounded-lg px-2 py-1 font-semibold transition-all duration-200 md:rounded-full md:px-4 md:py-2 md:text-sm ${
              isLibraryContext
                ? "shadow-md ring-1 shadow-orange-500/20 ring-white/60 dark:ring-white/25"
                : "shadow-sm shadow-orange-500/15"
            }`}
          >
            <FilmIcon className="h-3 w-3 md:h-4 md:w-4" />
            <span className="md:max-fold:sr-only">{t("watchNow")}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderInner />
    </Suspense>
  );
}
