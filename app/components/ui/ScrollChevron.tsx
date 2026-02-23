"use client";

import { useEffect, useState } from "react";

import { ChevronDownIcon } from "../shared/Icons";

export function ScrollChevron({ label, scrollLabel }: { label: string; scrollLabel: string }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY < 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <a
      href="#events"
      className="hover:text-brand-400 fixed bottom-[calc(env(safe-area-inset-bottom)+6.5rem)] left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-neutral-500 transition-colors md:absolute md:bottom-8 md:flex md:gap-2"
      aria-label={scrollLabel}
    >
      <span className="text-[9px] font-bold tracking-[0.28em] uppercase sm:text-[10px]">
        {label}
      </span>
      <ChevronDownIcon className="h-4.5 w-4.5 animate-bounce opacity-70 sm:h-5 sm:w-5" />
    </a>
  );
}
