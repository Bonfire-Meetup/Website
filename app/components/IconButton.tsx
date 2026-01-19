import type { ReactNode } from "react";

type IconButtonSize = "sm" | "md" | "pill";
type IconButtonShape = "rounded" | "full";
type IconButtonVariant = "glass" | "plain";

type IconButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
  disabled?: boolean;
  className?: string;
  size?: IconButtonSize;
  shape?: IconButtonShape;
  variant?: IconButtonVariant;
  type?: "button" | "submit" | "reset";
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-9 w-9",
  md: "h-10 w-10",
  pill: "h-10 px-3",
};

const shapeClasses: Record<IconButtonShape, string> = {
  rounded: "rounded-xl",
  full: "rounded-full",
};

const variantClasses: Record<IconButtonVariant, string> = {
  glass: "glass",
  plain: "",
};

export function IconButton({
  children,
  onClick,
  ariaLabel,
  title,
  disabled = false,
  className = "",
  size = "md",
  shape = "rounded",
  variant = "glass",
  type = "button",
}: IconButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      disabled={disabled}
      className={`inline-flex items-center justify-center transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${shapeClasses[shape]} ${className}`}
    >
      {children}
    </button>
  );
}
