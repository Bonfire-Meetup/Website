"use client";

import { Pill } from "@/components/ui/Pill";

interface RecordingTagPillProps {
  tag: string;
  href?: string;
  className?: string;
  size?: "xxxs" | "xxs" | "xs" | "sm" | "md";
  showHash?: boolean;
}

export function RecordingTagPill({
  tag,
  href,
  className = "",
  size = "xxs",
  showHash = true,
}: RecordingTagPillProps) {
  return (
    <Pill
      href={href}
      size={size}
      className={`bg-brand-50 text-brand-700 hover:bg-brand-100 hover:text-brand-800 dark:bg-brand-500/12 dark:text-brand-200 dark:hover:bg-brand-500/20 dark:hover:text-brand-100 font-semibold tracking-[0.14em] uppercase transition-colors ${className}`}
      onClick={(event) => event.stopPropagation()}
      ariaLabel={`Filter by ${tag}`}
    >
      {showHash ? `#${tag}` : tag}
    </Pill>
  );
}
