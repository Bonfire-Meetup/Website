import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

type PillProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void;
  size?: "xxs" | "xs" | "sm" | "md";
  ariaLabel?: string;
  title?: string;
};

const sizeClasses: Record<NonNullable<PillProps["size"]>, string> = {
  xxs: "px-2.5 py-1 text-[10px]",
  xs: "px-3 py-1 text-[11px]",
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
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
    return (
      <Link href={href} onClick={onClick} className={classes} aria-label={ariaLabel} title={title}>
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
