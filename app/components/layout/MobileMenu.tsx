"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { LanguageToggle } from "../theme/LanguageToggle";
import { ThemeToggle } from "../theme/ThemeToggle";
import { useBodyScrollLock } from "../shared/useBodyScrollLock";

interface NavLink {
  href: string;
  label: string;
  prefetch?: boolean;
}

interface MobileMenuProps {
  links: NavLink[];
  menuLabel: string;
  closeLabel: string;
}

export function MobileMenu({ links, menuLabel, closeLabel }: MobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const animationMs = 220;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    if (href.startsWith("/#")) {
      return false;
    }

    return pathname.startsWith(href);
  };

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

      return;
    }

    if (!isRendered) {
      return;
    }

    closeTimer.current = setTimeout(() => {
      setIsRendered(false);
      closeTimer.current = null;
    }, animationMs);

    return () => {
      if (closeTimer.current) {
        clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };
  }, [isOpen, isRendered, animationMs]);

  useBodyScrollLock(isRendered);

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

  const menuContent =
    isRendered && mounted
      ? createPortal(
          <>
            <div
              className={`fixed inset-0 bg-black/60 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
              style={{ zIndex: 9998 }}
              onClick={closeMenu}
            />
            <div
              className={`fixed top-0 right-0 bottom-0 w-64 bg-white shadow-2xl transition duration-200 ease-out motion-reduce:transition-none ${
                isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
              } dark:bg-neutral-900`}
              style={{ zIndex: 9999 }}
            >
              <div className="flex h-14 items-center justify-between px-4">
                <span className="text-base font-semibold text-neutral-900 dark:text-white">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
                  aria-label={closeLabel}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="px-3 py-3">
                <ul className="space-y-0.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        prefetch={link.prefetch ?? isOpen}
                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                          isActiveLink(link.href)
                            ? "bg-rose-500/10 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400"
                            : "text-neutral-700 hover:bg-rose-100/60 hover:text-rose-700 dark:text-neutral-300 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
              </nav>
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
        className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-700 hover:bg-black/5 md:hidden dark:text-neutral-300 dark:hover:bg-white/10"
        aria-label={menuLabel}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {menuContent}
    </>
  );
}
