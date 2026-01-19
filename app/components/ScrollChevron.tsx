"use client";

import { useEffect, useState } from "react";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

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

  if (!isVisible) return null;

  return (
    <a
      href="#events"
      className="absolute bottom-6 z-20 flex flex-col items-center gap-2 text-neutral-500 transition-colors hover:text-brand-400 sm:bottom-10 sm:gap-3"
      aria-label={scrollLabel}
    >
      <span className="text-[9px] font-bold uppercase tracking-[0.3em] sm:text-[10px]">
        {label}
      </span>
      <ChevronDownIcon className="h-5 w-5 animate-bounce opacity-70 sm:h-6 sm:w-6" />
    </a>
  );
}
