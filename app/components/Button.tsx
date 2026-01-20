import Link from "next/link";
import type { ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "glass" | "plain" | "glass-secondary";
type ButtonSize = "xs" | "sm" | "md" | "lg";

type ButtonProps = {
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
};

const baseClasses =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl font-semibold transition";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 dark:bg-brand-500 dark:shadow-brand-500/30 dark:hover:bg-brand-400",
  secondary:
    "bg-white/80 text-neutral-600 shadow-sm ring-1 ring-black/5 hover:bg-white dark:bg-white/10 dark:text-neutral-300 dark:ring-white/10 dark:hover:bg-white/20",
  ghost:
    "text-neutral-600 hover:bg-brand-100/60 hover:text-brand-700 dark:text-neutral-400 dark:hover:bg-brand-500/10 dark:hover:text-brand-400",
  glass: "glass-button",
  "glass-secondary": "glass-button-secondary",
  plain: "",
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: "px-4 py-2 text-xs uppercase tracking-[0.22em]",
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-5 py-2.5 text-sm",
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
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClass} ${className}`;

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
