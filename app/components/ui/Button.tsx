import Link from "next/link";
import type { ReactNode } from "react";

import { DYNAMIC_ROUTE_PREFIXES } from "@/lib/routes/pages";

type ButtonVariant = "primary" | "secondary" | "ghost" | "glass" | "plain" | "glass-secondary";
type ButtonSize = "xs" | "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  ariaLabel?: string;
  external?: boolean;
  prefetch?: boolean;
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
}

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition";

const disabledClasses =
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:pointer-events-none";

const variantClasses: Record<ButtonVariant, string> = {
  ghost:
    "text-neutral-600 hover:bg-rose-100/60 hover:text-rose-700 dark:text-neutral-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400",
  glass: "glass-button",
  "glass-secondary": "glass-button-secondary",
  plain: "",
  primary:
    "bg-gradient-to-r from-fuchsia-700 via-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/25 hover:from-fuchsia-800 hover:via-orange-600 hover:to-red-700 dark:shadow-orange-500/30",
  secondary:
    "bg-white/80 text-neutral-600 shadow-sm ring-1 ring-black/5 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:ring-white/10 dark:hover:bg-white/20",
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: "px-5 py-2.5 text-sm",
  md: "px-5 py-3 text-sm",
  sm: "px-4 py-2 text-sm",
  xs: "px-4 py-2 text-xs uppercase tracking-[0.22em]",
};

export function Button({
  children,
  href,
  onClick,
  type = "button",
  disabled = false,
  className = "",
  variant = "primary",
  size = "sm",
  ariaLabel,
  external = false,
  prefetch,
  target,
  rel,
}: ButtonProps) {
  const sizeClass = variant === "glass" || variant === "glass-secondary" ? "" : sizeClasses[size];
  const classes = `${baseClasses} ${disabledClasses} ${variantClasses[variant]} ${sizeClass} ${className}`;

  if (href) {
    const isExternal = external || href.startsWith("http") || href.startsWith("mailto:");

    if (isExternal) {
      return (
        <a href={href} className={classes} aria-label={ariaLabel} target={target} rel={rel}>
          {children}
        </a>
      );
    }

    const isDynamicRoute =
      DYNAMIC_ROUTE_PREFIXES.some((prefix) => href.startsWith(prefix)) || href.includes("?");
    const shouldPrefetch = prefetch ?? !isDynamicRoute;

    return (
      <Link href={href} prefetch={shouldPrefetch} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={classes}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
