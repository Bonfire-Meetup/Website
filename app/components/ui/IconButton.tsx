import type { ReactNode } from "react";

type IconButtonSize = "sm" | "md" | "pill";
type IconButtonShape = "rounded" | "full";
type IconButtonVariant = "glass" | "plain";

interface IconButtonProps {
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
}

const sizeClasses: Record<IconButtonSize, string> = {
  md: "h-10 w-10",
  pill: "h-10 px-3",
  sm: "h-9 w-9",
};

const shapeClasses: Record<IconButtonShape, string> = {
  full: "rounded-full",
  rounded: "rounded-xl",
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
      className={`inline-flex cursor-pointer items-center justify-center transition-all ${variantClasses[variant]} ${sizeClasses[size]} ${shapeClasses[shape]} ${className}`}
    >
      {children}
    </button>
  );
}
