"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLink = {
  href: string;
  label: string;
  primary?: boolean;
};

type MobileMenuProps = {
  links: NavLink[];
  menuLabel: string;
  closeLabel: string;
};

export function MobileMenu({ links, menuLabel, closeLabel }: MobileMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return pathname === "/";
    return pathname.startsWith(href);
  };

  const openMenu = useCallback(() => {
    setIsVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsOpen(true);
      });
    });
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleTransitionEnd = useCallback(() => {
    if (!isOpen) {
      setIsVisible(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeMenu]);

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-neutral-700 transition-colors hover:bg-black/5 md:hidden dark:text-neutral-300 dark:hover:bg-white/10"
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

      {isVisible && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeMenu}
          />

          <div
            className={`absolute inset-y-0 right-0 w-64 bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-neutral-900 ${
              isOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onTransitionEnd={handleTransitionEnd}
          >
            <div className="flex h-14 items-center justify-between px-4">
              <span className="text-base font-semibold text-neutral-900 dark:text-white">Menu</span>
              <button
                type="button"
                onClick={closeMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
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
                {links.map((link, index) => (
                  <li
                    key={link.href}
                    className={`transition-all duration-300 ease-out ${
                      isOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                    }`}
                    style={{ transitionDelay: isOpen ? `${index * 40}ms` : "0ms" }}
                  >
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActiveLink(link.href)
                          ? "bg-brand-500/10 text-brand-600 dark:bg-brand-400/10 dark:text-brand-400"
                          : "text-neutral-700 hover:bg-black/5 dark:text-neutral-300 dark:hover:bg-white/10"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
