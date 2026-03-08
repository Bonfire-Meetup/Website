import Link from "next/link";
import type { ReactNode } from "react";

import { DYNAMIC_ROUTE_PREFIXES } from "@/lib/routes/pages";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "glass"
  | "plain"
  | "glass-secondary"
  | "fire-primary"
  | "hero-primary"
  | "hero-secondary";
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
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.99]";

const disabledClasses =
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:pointer-events-none";

const variantClasses: Record<ButtonVariant, string> = {
  ghost:
    "text-neutral-600 hover:bg-rose-100/60 hover:text-rose-700 dark:text-neutral-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400",
  glass: "glass-button",
  "glass-secondary": "glass-button-secondary",
  "fire-primary":
    "dark-gradient-button overflow-hidden border border-orange-300/35 bg-gradient-to-r from-orange-400 via-orange-500 to-rose-600 bg-clip-padding text-white shadow-[0_14px_30px_-16px_rgba(249,115,22,0.42)] transition-[border-color,box-shadow,filter] duration-300 hover:border-orange-300/50 hover:shadow-[0_18px_34px_-16px_rgba(244,63,94,0.34)] hover:brightness-103 dark:border-orange-300/25 dark:hover:border-orange-300/38 dark:shadow-orange-500/28",
  "hero-primary":
    "dark-gradient-button overflow-hidden rounded-2xl border border-orange-300/40 bg-gradient-to-r from-orange-400 via-orange-500 to-rose-600 bg-clip-padding text-white shadow-[0_16px_34px_-18px_rgba(249,115,22,0.42)] transition-[border-color,box-shadow,filter] duration-300 hover:border-orange-300/55 hover:shadow-[0_20px_38px_-18px_rgba(244,63,94,0.34)] hover:brightness-103 dark:border-orange-300/25 dark:hover:border-orange-300/38",
  "hero-secondary":
    "rounded-2xl border border-black/12 bg-white/78 text-neutral-700 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.26)] transition-[border-color,box-shadow,color,background-color] duration-300 hover:border-orange-300/45 hover:bg-white/84 hover:text-neutral-950 hover:shadow-[0_16px_30px_-22px_rgba(249,115,22,0.22)] dark:border-white/12 dark:bg-black/30 dark:text-white/78 dark:hover:border-orange-300/28 dark:hover:bg-black/34 dark:hover:text-white dark:hover:shadow-[0_16px_30px_-22px_rgba(249,115,22,0.16)]",
  plain: "",
  primary:
    "dark-gradient-button overflow-hidden border border-orange-300/35 bg-gradient-to-r from-orange-400 via-orange-500 to-rose-600 bg-clip-padding text-white shadow-[0_14px_30px_-16px_rgba(249,115,22,0.4)] transition-[border-color,box-shadow,filter] duration-300 hover:border-orange-300/50 hover:shadow-[0_18px_34px_-16px_rgba(244,63,94,0.32)] hover:brightness-103 dark:border-orange-300/25 dark:hover:border-orange-300/38 dark:shadow-orange-500/28",
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
        <a
          href={href}
          onClick={onClick}
          className={classes}
          aria-label={ariaLabel}
          target={target}
          rel={rel}
        >
          {children}
        </a>
      );
    }

    const isDynamicRoute =
      DYNAMIC_ROUTE_PREFIXES.some((prefix) => href.startsWith(prefix)) || href.includes("?");
    const shouldPrefetch = prefetch ?? !isDynamicRoute;

    return (
      <Link
        href={href}
        prefetch={shouldPrefetch}
        onClick={onClick}
        className={classes}
        aria-label={ariaLabel}
      >
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
