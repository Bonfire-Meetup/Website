import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

interface PillProps {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void;
  size?: "xxs" | "xs" | "sm" | "md";
  ariaLabel?: string;
  title?: string;
}

const sizeClasses: Record<NonNullable<PillProps["size"]>, string> = {
  md: "px-4 py-2 text-sm",
  sm: "px-3 py-1.5 text-xs",
  xs: "px-3 py-1 text-[11px]",
  xxs: "px-2.5 py-1 text-[10px]",
};

export function Pill({
  children,
  className = "",
  href,
  onClick,
  size = "sm",
  ariaLabel,
  title,
}: PillProps) {
  const classes = `inline-flex items-center rounded-full ${sizeClasses[size]} ${className}`;

  if (href) {
    const hasQueryParams = href.includes("?");
    return (
      <Link
        href={href}
        onClick={onClick}
        className={classes}
        aria-label={ariaLabel}
        title={title}
        prefetch={!hasQueryParams}
      >
        {children}
      </Link>
    );
  }

  return (
    <span className={classes} onClick={onClick} aria-label={ariaLabel} title={title}>
      {children}
    </span>
  );
}
