import type { MouseEvent, ReactNode } from "react";

import type { LocationValue } from "@/lib/config/constants";

import { Pill } from "../ui/Pill";

interface LocationPillProps {
  location: LocationValue;
  className?: string;
  ariaLabel?: string;
  icon?: ReactNode;
  size?: "xxs" | "xs" | "sm" | "md";
  variant?: "city" | "neutral";
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement | HTMLSpanElement>) => void;
  title?: string;
}

export function LocationPill({
  location,
  className = "",
  ariaLabel,
  icon,
  size = "sm",
  variant = "city",
  href,
  onClick,
  title,
}: LocationPillProps) {
  const variantClass = variant === "city" ? location.toLowerCase() : "";
  return (
    <Pill
      href={href}
      onClick={onClick}
      size={size}
      className={`location-badge ${variantClass} ${className}`}
      aria-label={ariaLabel}
      title={title}
    >
      {icon}
      {location}
    </Pill>
  );
}
