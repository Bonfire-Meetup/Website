import Link from "next/link";
import type { ReactNode } from "react";

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
  target?: "_blank" | "_self" | "_parent" | "_top";
  rel?: string;
}

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition";

const disabledClasses =
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:pointer-events-none";

const variantClasses: Record<ButtonVariant, string> = {
  ghost:
    "text-neutral-600 hover:bg-brand-100/60 hover:text-brand-700 dark:text-neutral-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400",
  glass: "glass-button",
  "glass-secondary": "glass-button-secondary",
  plain: "",
  primary:
    "bg-gradient-to-r from-brand-600 to-rose-500 text-white shadow-lg shadow-rose-500/25 hover:from-brand-500 hover:to-rose-400 dark:from-brand-500 dark:to-rose-400 dark:shadow-rose-400/30 dark:hover:from-brand-400 dark:hover:to-rose-300",
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

    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
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
